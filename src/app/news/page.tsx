import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { dbAll } from "@/lib/database";
import { formatDateTime } from "@/lib/format";
import { newsBodyPreview } from "@/lib/newsBody";
import type { NewsItem } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function NewsPage() {
  const items = await dbAll<NewsItem>(
    `SELECT * FROM news
     WHERE status = 'active'
     ORDER BY created_at DESC`,
  );

  return (
    <>
      <SiteHeader showBack />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6 pb-12 text-left sm:px-6 lg:px-8 xl:ml-[8%] xl:mr-auto xl:max-w-4xl">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--primary)]">
          Updates
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-home-serif)] text-3xl font-extrabold tracking-tight text-[var(--primary)]">
          News
        </h1>

        {items.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-10 text-left">
            <p className="text-sm text-[var(--muted)]">
              No news posts yet. Check back soon.
            </p>
            <Link
              href="/"
              className="mt-4 inline-block text-sm font-semibold text-[var(--primary)]"
            >
              ← Back home
            </Link>
          </div>
        ) : (
          <div className="mt-8 w-full space-y-4">
            {items.map((item) => (
              <Link
                key={item.id}
                href={`/news/${item.id}`}
                className="block w-full overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] text-left transition hover:border-[var(--primary)]/30"
              >
                <article className="flex flex-row">
                  <div className="relative h-[108px] w-[108px] shrink-0 bg-[var(--surface-muted)] sm:h-auto sm:min-h-[160px] sm:w-[240px] lg:w-[280px]">
                    {item.image_path ? (
                      <Image
                        src={item.image_path}
                        alt={item.heading || "News"}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 108px, 280px"
                      />
                    ) : (
                      <div className="flex h-full min-h-[108px] items-center justify-center text-xs text-[var(--muted)] sm:text-sm">
                        No image
                      </div>
                    )}
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col items-start justify-center p-3 text-left sm:p-5">
                    <p className="text-[10px] font-medium text-[var(--muted)] sm:text-xs">
                      {formatDateTime(item.created_at)}
                    </p>
                    {item.heading ? (
                      <h2 className="mt-1 line-clamp-2 text-[15px] font-bold leading-snug text-[var(--text)] sm:mt-1.5 sm:line-clamp-none sm:text-lg lg:text-xl">
                        {item.heading}
                      </h2>
                    ) : null}
                    <p className="mt-1.5 line-clamp-2 w-full whitespace-pre-wrap text-left text-xs leading-relaxed text-[var(--text)] sm:mt-2 sm:line-clamp-3 sm:text-sm">
                      {newsBodyPreview(item.body)}
                    </p>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
