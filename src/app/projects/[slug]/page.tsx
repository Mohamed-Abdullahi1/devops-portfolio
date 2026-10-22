import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { projects } from "@/data/projects";
import {
  ArrowLeft,
  ArrowUpRight,
  Code2,
  Lightbulb,
  Layers3,
  ShieldCheck,
  Wrench,
} from "lucide-react";

function SectionHeading({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title: string;
}) {
  return (
    <div className="mb-8">
      <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-neutral-500">
        {eyebrow}
      </p>

      <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
        {title}
      </h2>
    </div>
  );
}

function Paragraphs({ items }: { items: string[] }) {
  return (
    <div className="space-y-5">
      {items.map((paragraph, index) => (
        <p
          key={index}
          className="text-base leading-8 text-neutral-300"
        >
          {paragraph}
        </p>
      ))}
    </div>
  );
}

export function generateStaticParams() {
  return Object.keys(projects).map((slug) => ({
    slug,
  }));
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const project = projects[slug];

  if (!project) {
    notFound();
  }

  const otherProjects = Object.entries(projects).filter(
    ([key]) => key !== slug
  );

  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl px-6 sm:px-10">
      {/* Navigation */}
      <header className="flex flex-wrap items-center justify-between gap-5 border-b border-neutral-800 py-8">
        <Link
          href="/"
          className="text-base font-semibold tracking-tight text-white"
        >
          Mohamed Abdullahi
        </Link>

        <Link
          href="/#projects"
          className="inline-flex items-center gap-2 text-sm text-neutral-400 transition-colors hover:text-white"
        >
          <ArrowLeft size={16} />
          All projects
        </Link>
      </header>

      {/* Hero */}
      <section className="pb-14 pt-20 sm:pt-24">
        <div className="mb-7 flex flex-wrap items-center gap-3 text-xs text-neutral-500">
          <span>{project.category}</span>
          <span>·</span>
          <span>{project.year}</span>
          <span>·</span>
          <span>Case study</span>
        </div>

        <h1 className="max-w-3xl text-4xl font-semibold leading-[1.15] tracking-tight text-white sm:text-5xl">
          {project.title}
        </h1>

        <p className="mt-7 max-w-2xl text-lg leading-8 text-neutral-400">
          {project.subtitle}
        </p>

        <div className="mt-9 flex flex-wrap items-center gap-6">
          <a
            href={project.github}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-md bg-white px-5 py-3 text-sm font-medium text-black transition-colors hover:bg-neutral-200"
          >
            <Code2 size={17} />
            View GitHub repository
            <ArrowUpRight size={15} />
          </a>

          <Link
            href="/#projects"
            className="inline-flex items-center gap-2 text-sm text-neutral-400 transition-colors hover:text-white"
          >
            <ArrowLeft size={16} />
            Back to projects
          </Link>
        </div>
      </section>

      {/* Technologies */}
      <section className="border-y border-neutral-800 py-8">
        <p className="mb-5 text-xs font-medium uppercase tracking-[0.2em] text-neutral-500">
          Technologies
        </p>

        <div className="flex flex-wrap gap-2">
          {project.technologies.map((technology) => (
            <span
              key={technology}
              className="rounded-md border border-neutral-800 bg-neutral-900/40 px-3 py-2 text-xs text-neutral-300"
            >
              {technology}
            </span>
          ))}
        </div>
      </section>

      {/* Overview */}
      <section className="py-16 sm:py-20">
        <SectionHeading
          eyebrow="The project"
          title="Overview"
        />

        <Paragraphs items={project.overview} />
      </section>

      {/* Architecture diagram */}
      <section className="pb-16 sm:pb-20">
        <SectionHeading
          eyebrow="System design"
          title="Architecture"
        />

        <div className="overflow-hidden rounded-xl border border-neutral-800 bg-white p-4 sm:p-8">
          <Image
            src={project.image}
            alt={`${project.title} architecture diagram`}
            width={1400}
            height={900}
            className="h-auto w-full object-contain"
            priority
          />
        </div>

        <p className="mt-4 text-sm leading-7 text-neutral-500">
          Architecture diagram from the project.
        </p>
      </section>

      {/* Challenge */}
      <section className="border-t border-neutral-800 py-16 sm:py-20">
        <div className="mb-8 flex items-center gap-3 text-neutral-500">
          <Wrench size={20} />
          <span className="text-xs font-medium uppercase tracking-[0.2em]">
            Engineering problem
          </span>
        </div>

        <h2 className="mb-8 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          The challenge
        </h2>

        <Paragraphs items={project.challenge} />
      </section>

      {/* Architecture decisions */}
      <section className="border-t border-neutral-800 py-16 sm:py-20">
        <div className="mb-8 flex items-center gap-3 text-neutral-500">
          <Layers3 size={20} />
          <span className="text-xs font-medium uppercase tracking-[0.2em]">
            Platform design
          </span>
        </div>

        <h2 className="mb-10 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          How the architecture works
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          {project.architecture.map((item) => (
            <div
              key={item.title}
              className="rounded-lg border border-neutral-800 bg-neutral-900/30 p-6"
            >
              <h3 className="mb-3 text-base font-semibold text-white">
                {item.title}
              </h3>

              <p className="text-sm leading-7 text-neutral-400">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Implementation */}
      <section className="border-t border-neutral-800 py-16 sm:py-20">
        <SectionHeading
          eyebrow="Behind the build"
          title="Implementation"
        />

        <div className="space-y-14">
          {project.implementation.map((item) => (
            <div key={item.title}>
              <h3 className="mb-5 text-xl font-semibold tracking-tight text-white">
                {item.title}
              </h3>

              <Paragraphs items={item.description} />
            </div>
          ))}
        </div>
      </section>

      {/* Lessons */}
      <section className="border-t border-neutral-800 py-16 sm:py-20">
        <div className="mb-8 flex items-center gap-3 text-neutral-500">
          <Lightbulb size={20} />
          <span className="text-xs font-medium uppercase tracking-[0.2em]">
            Engineering insights
          </span>
        </div>

        <h2 className="mb-10 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Key takeaways
        </h2>

        <div className="space-y-5">
          {project.lessons.map((lesson, index) => (
            <div
              key={index}
              className="flex items-start gap-4"
            >
              <ShieldCheck
                size={18}
                className="mt-1 shrink-0 text-neutral-500"
              />

              <p className="text-base leading-8 text-neutral-300">
                {lesson}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Conclusion */}
      <section className="border-t border-neutral-800 py-16 sm:py-20">
        <SectionHeading
          eyebrow="Reflection"
          title="What this project taught me"
        />

        <p className="text-base leading-8 text-neutral-300">
          {project.conclusion}
        </p>

        <a
          href={project.github}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-10 inline-flex items-center gap-2 border-b border-neutral-500 pb-1 text-sm font-medium text-white transition-colors hover:border-white"
        >
          Explore the source code
          <ArrowUpRight size={16} />
        </a>
      </section>

      {/* Other projects */}
      <section className="border-t border-neutral-800 py-16">
        <h2 className="mb-8 text-xl font-semibold tracking-tight text-white">
          More projects
        </h2>

        <div className="divide-y divide-neutral-800 border-t border-neutral-800">
          {otherProjects.map(([key, item]) => (
            <Link
              key={key}
              href={`/projects/${key}`}
              className="group flex items-start justify-between gap-5 py-6"
            >
              <div>
                <p className="mb-2 text-xs text-neutral-500">
                  {item.category}
                </p>

                <h3 className="text-base font-medium text-neutral-200 transition-colors group-hover:text-white">
                  {item.title}
                </h3>
              </div>

              <ArrowUpRight
                size={18}
                className="shrink-0 text-neutral-500 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1"
              />
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