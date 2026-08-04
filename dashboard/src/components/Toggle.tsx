type Props = {
  name: string;
  label: string;
  hint?: string;
  defaultChecked?: boolean;
};

export function Toggle({ name, label, hint, defaultChecked }: Props) {
  return (
    <label className="toggle-row">
      <span className="toggle-text">
        <strong>{label}</strong>
        {hint && <small>{hint}</small>}
      </span>
      <span className="toggle">
        <input type="checkbox" name={name} defaultChecked={defaultChecked} />
        <span className="toggle-track" aria-hidden="true" />
      </span>
    </label>
  );
}
