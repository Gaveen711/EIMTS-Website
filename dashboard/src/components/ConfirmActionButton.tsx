"use client";

type Props = {
  children: React.ReactNode;
  message: string;
  className?: string;
};

export function ConfirmActionButton({ children, message, className }: Props) {
  return (
    <button
      className={className}
      type="submit"
      onClick={(event) => {
        if (!window.confirm(message)) event.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
