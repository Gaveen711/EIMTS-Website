"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";
import { AuthField } from "@/components/AuthField";
import { DotGridBackground } from "@/components/DotGridBackground";

const MAX_ATTEMPTS = 5;
const LOCK_SECONDS = 30;

type View = "sign-in" | "forgot" | "sent";

export default function LoginPage() {
  const router = useRouter();
  const [view, setView] = useState<View>("sign-in");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [sentTo, setSentTo] = useState("");
  const [lockRemaining, setLockRemaining] = useState(0);
  const attemptsRef = useRef(0);

  // Anyone with a live session has no business on the login screen.
  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;
    let active = true;
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (active && user) {
        router.replace("/");
        router.refresh();
      }
    });
    return () => {
      active = false;
    };
  }, [router]);

  useEffect(() => {
    if (lockRemaining <= 0) {
      attemptsRef.current = 0;
      return;
    }
    const timer = setTimeout(() => setLockRemaining((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [lockRemaining]);

  function switchView(next: View) {
    setView(next);
    setError("");
  }

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || lockRemaining > 0) return;

    const supabase = createClient();
    if (!supabase) {
      setError("Supabase is not connected. Add the project keys and reload.");
      return;
    }

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") || "").trim().toLowerCase();
    const password = String(form.get("password") || "");
    if (!email || !password) return;

    setBusy(true);
    setError("");
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setBusy(false);

    if (signInError) {
      attemptsRef.current += 1;
      if (attemptsRef.current >= MAX_ATTEMPTS) {
        setLockRemaining(LOCK_SECONDS);
      } else {
        // One generic message no matter what failed, so the form never
        // confirms whether an email address is registered.
        setError("Incorrect email or password.");
      }
      return;
    }

    router.replace("/");
    router.refresh();
  }

  async function sendReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;

    const supabase = createClient();
    if (!supabase) {
      setError("Supabase is not connected. Add the project keys and reload.");
      return;
    }

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") || "").trim().toLowerCase();
    if (!email) return;

    setBusy(true);
    setError("");
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email,
      { redirectTo: `${window.location.origin}/reset-password` },
    );
    setBusy(false);

    if (resetError) {
      setError(
        "The reset email could not be sent right now. Wait a minute and try again.",
      );
      return;
    }

    setSentTo(email);
    switchView("sent");
  }

  return (
    <main className="auth-page">
      <DotGridBackground />
      <div className="auth-vignette" aria-hidden="true" />

      <section className="auth-card">
        <span className="auth-mark" aria-hidden="true">
          EI
        </span>

        {view === "sign-in" && (
          <>
            <h1>Sign in to the Content Desk</h1>
            <p className="auth-sub">
              Use the staff account created by your administrator.
            </p>
            <form className="auth-form" onSubmit={signIn}>
              <AuthField
                label="Work email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="name@emeraldisle.lk"
                required
              />
              <AuthField
                label="Password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="Your password"
                required
              />
              <button
                className={`primary-button auth-submit${busy ? " is-pending" : ""}`}
                type="submit"
                disabled={busy || lockRemaining > 0}
              >
                {busy ? "Signing in…" : "Sign in"}
              </button>
              <p className="auth-message" aria-live="polite" role="alert">
                {lockRemaining > 0
                  ? `Too many failed attempts. Try again in ${lockRemaining}s.`
                  : error}
              </p>
            </form>
            <div className="auth-links">
              <span>
                Forgot your password?{" "}
                <button type="button" onClick={() => switchView("forgot")}>
                  Reset it
                </button>
              </span>
            </div>
          </>
        )}

        {view === "forgot" && (
          <>
            <h1>Reset your password</h1>
            <p className="auth-sub">
              Enter your work email and we&rsquo;ll send you a secure link to
              choose a new password.
            </p>
            <form className="auth-form" onSubmit={sendReset}>
              <AuthField
                label="Work email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="name@emeraldisle.lk"
                required
              />
              <button
                className={`primary-button auth-submit${busy ? " is-pending" : ""}`}
                type="submit"
                disabled={busy}
              >
                {busy ? "Sending…" : "Send reset link"}
              </button>
              <p className="auth-message" aria-live="polite" role="alert">
                {error}
              </p>
            </form>
            <div className="auth-links">
              <button type="button" onClick={() => switchView("sign-in")}>
                &larr; Back to sign in
              </button>
            </div>
          </>
        )}

        {view === "sent" && (
          <>
            <h1>Check your inbox</h1>
            <p className="auth-sub">
              If <strong>{sentTo}</strong> matches a staff account, a password
              reset link is on its way. Open it on this device — it expires
              after about an hour.
            </p>
            <div className="auth-links">
              <button type="button" onClick={() => switchView("sign-in")}>
                &larr; Back to sign in
              </button>
              <span>
                Nothing arrived?{" "}
                <button type="button" onClick={() => switchView("forgot")}>
                  Send it again
                </button>
              </span>
            </div>
          </>
        )}

        <p className="auth-footnote">
          Restricted area for authorised Emerald Isle staff. Accounts are
          created by an administrator — sign-ups are disabled.
        </p>
      </section>
    </main>
  );
}
