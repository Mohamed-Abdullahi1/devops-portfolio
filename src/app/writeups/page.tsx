import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { writeups } from "@/data/writeups";

export default function WriteupsPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-4 sm:px-10">
      {/* Navigation */}
      <header className="flex flex-wrap items-center justify-between gap-5 border-b border-neutral-800 py-8">
        <Link
          href="/"
          className="text-base font-semibold tracking-tight text-white"
        >
          Mohamed Abdullahi
        </Link>

        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-neutral-400 transition-colors hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to portfolio
        </Link>
      </header>

      {/* Introduction */}
      <section className="border-b border-neutral-800 pb-14 pt-20 sm:pt-24">
        <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.16em] text-neutral-500">
          Engineering notes
        </p>

        <h1 className="text-4xl font-semibold tracking-[-0.055em] text-white sm:text-5xl">
          Writing.
        </h1>

        <p className="mt-7 max-w-2xl text-base leading-8 text-neutral-400">
          Technical write-ups exploring cloud infrastructure,
          deployment engineering, security and the decisions
          behind building reliable systems.
        </p>
      </section>

      {/* Articles */}
      <section className="py-10">
        <div className="divide-y divide-neutral-800 border-t border-neutral-800">
          {writeups.map((article) => (
            <Link
              key={article.slug}
              href={`/writeups/${article.slug}`}
              className="group flex flex-col gap-5 py-8 transition-colors sm:flex-row sm:items-start sm:justify-between sm:py-10"
            >
              <div className="min-w-0 max-w-2xl">
                <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.12em] text-neutral-500">
                  {article.category}
                </p>

                <h2 className="text-xl font-medium tracking-[-0.035em] text-neutral-200 transition-colors group-hover:text-white sm:text-2xl">
                  {article.title}
                </h2>

                <p className="mt-3 text-sm leading-7 text-neutral-500">
                  {article.description}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-5">
                <time className="font-mono text-[11px] text-neutral-600">
                  {article.date}
                </time>

                <ArrowUpRight
                  size={18}
                  className="text-neutral-500 transition-transform duration-200 group-hover:-translate-y-1 group-hover:translate-x-1"
                />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="flex items-center justify-between gap-4 border-t border-neutral-800 py-8 text-xs text-neutral-500">
        <span>© 2026 Mohamed Abdullahi</span>

        <Link
          href="/"
          className="inline-flex items-center gap-1 transition-colors hover:text-white"
        >
          Portfolio
          <ArrowUpRight size={13} />
        </Link>
      </footer>
    </main>
  );
}
