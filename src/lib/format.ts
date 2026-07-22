export function formatDateTime(date: string | null | undefined): string {
  if (!date) return "—";

  const normalized = date.includes("T") ? date : `${date.replace(" ", "T")}Z`;
  const parsed = new Date(normalized);

  if (Number.isNaN(parsed.getTime())) return date;

  return parsed.toLocaleString("en-NP", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
