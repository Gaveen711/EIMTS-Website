"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button className="primary-button" type="submit" disabled={pending}>
      {pending ? "Saving…" : label}
    </button>
  );
}
