export function formatDateTime(
  date: string | Date | null | undefined,
): string {
  if (date == null || date === "") return "—";

  // MySQL (mysql2) often returns DATETIME as Date; SQLite returns strings.
  if (date instanceof Date) {
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleString("en-NP", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

  const asString = String(date);
  const normalized = asString.includes("T")
    ? asString
    : `${asString.replace(" ", "T")}Z`;
  const parsed = new Date(normalized);

  if (Number.isNaN(parsed.getTime())) return asString;

  return parsed.toLocaleString("en-NP", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
