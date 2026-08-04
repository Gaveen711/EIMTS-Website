"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";
import { AuthField } from "@/components/AuthField";
import { DotGridBackground } from "@/components/DotGridBackground";

type Phase = "checking" | "ready" | "invalid" | "done";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("checking");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  // The emailed link lands here with a one-time code. The Supabase client
  // exchanges it for a recovery session automatically; we wait for that to
  // settle before offering the form so an expired link never shows it.
  useEffect(() => {
    const supabase = createClient();
    if (!supabase) {
      setPhase("invalid");
      return;
    }

    let settled = false;
    const settle = (next: Phase) => {
      if (!settled) {
        settled = true;
        setPhase(next);
      }
    };

    const url = new URL(window.location.href);
    const hasCode =
      url.searchParams.has("code") || url.hash.includes("access_token");
    if (url.searchParams.has("error") || url.hash.includes("error")) {
      settle("invalid");
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        settle("ready");
      }
    });

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) settle("ready");
      else if (!hasCode) settle("invalid");
    });

    const failTimer = setTimeout(
      () => settle("invalid"),
      hasCode ? 8000 : 3000,
    );

    return () => {
      subscription.unsubscribe();
      clearTimeout(failTimer);
    };
  }, []);

  const rules = [
    { label: "At least 12 characters", met: password.length >= 12 },
    { label: "Contains a letter", met: /[a-zA-Z]/.test(password) },
    { label: "Contains a number", met: /\d/.test(password) },
  ];
  const strongEnough = rules.every((rule) => rule.met);
  const mismatch = confirm.length > 0 && password !== confirm;

  async function savePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;

    if (!strongEnough) {
      setError("Choose a password that meets all three requirements below.");
      return;
    }
    if (password !== confirm) {
      setError("The two passwords do not match.");
      return;
    }

    const supabase = createClient();
    if (!supabase) {
      setError("Supabase is not connected. Add the project keys and reload.");
      return;
    }

    setBusy(true);
    setError("");
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setBusy(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setPhase("done");
  }

  return (
    <main className="auth-page">
      <DotGridBackground />
      <div className="auth-vignette" aria-hidden="true" />

      <section className="auth-card">
        <span className="auth-mark" aria-hidden="true">
          EI
        </span>

        {phase === "checking" && (
          <>
            <h1>Checking your link…</h1>
            <p className="auth-sub">Hold on while we verify the reset link.</p>
          </>
        )}

        {phase === "invalid" && (
          <>
            <h1>This link has expired</h1>
            <p className="auth-sub">
              Password reset links are single-use and short-lived. Request a
              fresh one and open it on this device.
            </p>
            <div className="auth-links">
              <a href="/login">&larr; Back to sign in</a>
            </div>
          </>
        )}

        {phase === "ready" && (
          <>
            <h1>Choose a new password</h1>
            <p className="auth-sub">
              Set a strong password you have not used anywhere else.
            </p>
            <form className="auth-form" onSubmit={savePassword}>
              <AuthField
                label="New password"
                name="password"
                type="password"
                autoComplete="new-password"
                placeholder="Minimum 12 characters"
                required
                minLength={12}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              <ul className="password-hints">
                {rules.map((rule) => (
                  <li key={rule.label} className={rule.met ? "met" : ""}>
                    {rule.label}
                  </li>
                ))}
              </ul>
              <AuthField
                label="Confirm new password"
                name="confirm"
                type="password"
                autoComplete="new-password"
                placeholder="Repeat the password"
                required
                value={confirm}
                onChange={(event) => setConfirm(event.target.value)}
              />
              <button
                className={`primary-button auth-submit${busy ? " is-pending" : ""}`}
                type="submit"
                disabled={busy}
              >
                {busy ? "Saving…" : "Save new password"}
              </button>
              <p className="auth-message" aria-live="polite" role="alert">
                {mismatch && !error ? "The two passwords do not match." : error}
              </p>
            </form>
          </>
        )}

        {phase === "done" && (
          <>
            <h1>Password updated</h1>
            <p className="auth-sub">
              You&rsquo;re signed in with your new password. Anyone else using
              the old one is locked out from now on.
            </p>
            <button
              className="primary-button auth-submit"
              type="button"
              onClick={() => {
                router.replace("/");
                router.refresh();
              }}
            >
              Continue to dashboard
            </button>
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
