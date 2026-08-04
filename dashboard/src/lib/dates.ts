// Schedule dates typed into the dashboard are Sri Lanka dates — the audience
// every visibility window is aimed at. Postgres reads a bare "2026-05-01" as
// midnight UTC, which shifts the whole window 5½ hours, so the offset is made
// explicit when writing and the date is converted back when displaying.
const COLOMBO_OFFSET = "+05:30";

export function colomboDayStart(date: string) {
  return `${date}T00:00:00${COLOMBO_OFFSET}`;
}

export function colomboDayEnd(date: string) {
  return `${date}T23:59:59${COLOMBO_OFFSET}`;
}

// en-CA formats as YYYY-MM-DD, the value <input type="date"> expects.
const colomboDay = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Colombo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function toColomboDateInput(timestamp: string | null | undefined) {
  if (!timestamp) return "";
  const parsed = new Date(timestamp);
  return Number.isNaN(parsed.getTime()) ? "" : colomboDay.format(parsed);
}
