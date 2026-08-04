"use client";

import {
  useId,
  useState,
  type InputHTMLAttributes,
  type KeyboardEvent,
} from "react";

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="m4 7.5 8 5.5 8-5.5" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="4.5" y="10.5" width="15" height="9.5" rx="2.5" />
      <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m4 4 16 16" />
      <path d="M10.6 6.2A10.8 10.8 0 0 1 12 6.1c6 0 9.5 5.9 9.5 5.9a17.9 17.9 0 0 1-2.3 3.1M6.7 6.9C4.1 8.6 2.5 12 2.5 12s3.5 5.9 9.5 5.9c1.3 0 2.6-.3 3.7-.8" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    </svg>
  );
}

type AuthFieldProps = {
  label: string;
  type?: "text" | "email" | "password";
} & Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "id" | "className" | "onKeyUp" | "onBlur"
>;

export function AuthField({ label, type = "text", ...inputProps }: AuthFieldProps) {
  const id = useId();
  const [revealed, setRevealed] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const isPassword = type === "password";

  function trackCapsLock(event: KeyboardEvent<HTMLInputElement>) {
    if (!isPassword) return;
    setCapsLockOn(event.getModifierState?.("CapsLock") ?? false);
  }

  return (
    <div className="auth-field">
      <label htmlFor={id}>{label}</label>
      <div className="auth-input-shell">
        {type === "email" ? <MailIcon /> : isPassword ? <LockIcon /> : null}
        <input
          id={id}
          type={isPassword && revealed ? "text" : type}
          spellCheck={false}
          autoCapitalize="none"
          onKeyUp={trackCapsLock}
          onBlur={() => setCapsLockOn(false)}
          {...inputProps}
        />
        {isPassword && (
          <button
            className="auth-eye"
            type="button"
            aria-label={revealed ? "Hide password" : "Show password"}
            aria-pressed={revealed}
            onClick={() => setRevealed((visible) => !visible)}
          >
            {revealed ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        )}
      </div>
      {capsLockOn && <p className="auth-caps" role="status">Caps Lock is on</p>}
    </div>
  );
}
