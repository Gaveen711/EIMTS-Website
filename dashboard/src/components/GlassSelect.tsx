"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";

type Option = { value: string; label: string };

type Props = {
  name: string;
  options: Array<Option | string>;
  defaultValue?: string;
  ariaLabel?: string;
};

function normalize(options: Array<Option | string>): Option[] {
  return options.map((option) =>
    typeof option === "string" ? { value: option, label: option } : option,
  );
}

export function GlassSelect({ name, options, defaultValue, ariaLabel }: Props) {
  const items = normalize(options);
  const fallback = items[0]?.value ?? "";
  const [value, setValue] = useState(defaultValue ?? fallback);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listboxId = useId();

  const matchIndex = items.findIndex((item) => item.value === value);
  // A stored value outside the current options (e.g. legacy data) must stay
  // visible and submittable instead of masquerading as the first option.
  const selected =
    matchIndex >= 0
      ? items[matchIndex]
      : value
        ? { value, label: value }
        : undefined;

  const close = useCallback((refocus: boolean) => {
    setOpen(false);
    if (refocus) triggerRef.current?.focus();
  }, []);

  function openList(startIndex = Math.max(0, matchIndex)) {
    setActiveIndex(startIndex);
    setOpen(true);
  }

  function commit(index: number) {
    const item = items[index];
    if (item) setValue(item.value);
    close(true);
  }

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (rootRef.current?.contains(target)) return;
      // The wrapping <label> forwards its clicks to the trigger button;
      // closing here too would make that forwarded click reopen the list.
      if (rootRef.current?.closest("label")?.contains(target)) return;
      close(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open, close]);

  useEffect(() => {
    if (!open) return;
    listRef.current?.focus({ preventScroll: true });
    listRef.current
      ?.querySelector('[data-active="true"]')
      ?.scrollIntoView({ block: "nearest" });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    listRef.current
      ?.querySelector('[data-active="true"]')
      ?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, open]);

  function onTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
      event.preventDefault();
      openList();
    }
  }

  function onListKeyDown(event: KeyboardEvent<HTMLUListElement>) {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setActiveIndex((index) => Math.min(index + 1, items.length - 1));
        break;
      case "ArrowUp":
        event.preventDefault();
        setActiveIndex((index) => Math.max(index - 1, 0));
        break;
      case "Home":
        event.preventDefault();
        setActiveIndex(0);
        break;
      case "End":
        event.preventDefault();
        setActiveIndex(items.length - 1);
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        commit(activeIndex);
        break;
      case "Escape":
        event.preventDefault();
        close(true);
        break;
      case "Tab":
        close(false);
        break;
    }
  }

  return (
    <div className="glass-select" ref={rootRef}>
      <input type="hidden" name={name} value={value} />
      <button
        ref={triggerRef}
        type="button"
        className="glass-select-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        onClick={() => (open ? close(false) : openList())}
        onKeyDown={onTriggerKeyDown}
      >
        <span>{selected?.label ?? "Select…"}</span>
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {open && (
        <ul
          ref={listRef}
          id={listboxId}
          className="glass-select-list"
          role="listbox"
          aria-label={ariaLabel}
          tabIndex={-1}
          aria-activedescendant={`${listboxId}-${activeIndex}`}
          onKeyDown={onListKeyDown}
        >
          {items.map((item, index) => (
            <li
              key={item.value}
              id={`${listboxId}-${index}`}
              role="option"
              aria-selected={item.value === value}
              data-active={index === activeIndex || undefined}
              onPointerMove={() => setActiveIndex(index)}
              onClick={() => commit(index)}
            >
              <span>{item.label}</span>
              {item.value === value && (
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m5 13 4 4L19 7" />
                </svg>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
