import type { ReactNode } from "react";

/**
 * Renders news body text.
 * Lines starting with "## " become bold subheadings mid-content.
 */
export function renderNewsBody(
  body: string,
  options?: { className?: string; subheadingClassName?: string },
): ReactNode {
  const text = body ?? "";
  const blocks = text.split(/\n/);
  const paragraphClass =
    options?.className ??
    "whitespace-pre-wrap text-sm leading-relaxed text-[var(--text)]";
  const subheadingClass =
    options?.subheadingClassName ??
    "mt-4 mb-1 text-base font-bold leading-snug text-[var(--text)] first:mt-0";

  const nodes: ReactNode[] = [];
  let paragraphLines: string[] = [];

  function flushParagraph(key: string) {
    if (paragraphLines.length === 0) return;
    const content = paragraphLines.join("\n");
    if (content.trim()) {
      nodes.push(
        <p key={key} className={paragraphClass}>
          {content}
        </p>,
      );
    }
    paragraphLines = [];
  }

  blocks.forEach((line, index) => {
    const match = line.match(/^##\s+(.+)$/);
    if (match) {
      flushParagraph(`p-${index}`);
      nodes.push(
        <h3 key={`h-${index}`} className={subheadingClass}>
          {match[1].trim()}
        </h3>,
      );
      return;
    }
    paragraphLines.push(line);
  });

  flushParagraph("p-end");

  if (nodes.length === 0) {
    return <p className={paragraphClass}>{text}</p>;
  }

  return <div className="space-y-2">{nodes}</div>;
}

/** Plain preview without subheading markers for list cards. */
export function newsBodyPreview(body: string): string {
  return (body ?? "")
    .split(/\n/)
    .map((line) => {
      const match = line.match(/^##\s+(.+)$/);
      return match ? match[1].trim() : line;
    })
    .join("\n")
    .trim();
}
