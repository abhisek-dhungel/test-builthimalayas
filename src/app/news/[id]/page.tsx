import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { dbGet } from "@/lib/database";
import { formatDateTime } from "@/lib/format";
import { renderNewsBody } from "@/lib/newsBody";
import type { NewsItem } from "@/lib/types";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function NewsDetailPage({ params }: Props) {
  const { id } = await params;
  const item = await dbGet<NewsItem>(
    `SELECT * FROM news WHERE id = ? AND status = 'active'`,
    [Number(id)],
  );

  if (!item) notFound();

  return (
    <>
      <SiteHeader showBack />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 pb-12">
        <Link
          href="/news"
          className="text-xs font-semibold text-[var(--primary)]"
        >
          ← All news
        </Link>

        <article className="mt-5 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
          {item.image_path ? (
            <div className="relative aspect-[16/9] w-full bg-[var(--surface-muted)]">
              <Image
                src={item.image_path}
                alt={item.heading || "News"}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 768px"
                priority
              />
            </div>
          ) : null}

          <div className="p-5 sm:p-7">
            <p className="text-xs font-medium text-[var(--muted)]">
              {formatDateTime(item.created_at)}
            </p>
            {item.heading ? (
              <h1 className="mt-2 text-2xl font-bold leading-snug text-[var(--text)] sm:text-3xl">
                {item.heading}
              </h1>
            ) : null}
            <div className="mt-4">
              {renderNewsBody(item.body, {
                className:
                  "whitespace-pre-wrap text-[15px] leading-relaxed text-[var(--text)] sm:text-base",
                subheadingClassName:
                  "mt-5 mb-2 text-lg font-bold leading-snug text-[var(--primary)] first:mt-0 sm:text-xl",
              })}
            </div>
          </div>
        </article>
      </main>
    </>
  );
}
