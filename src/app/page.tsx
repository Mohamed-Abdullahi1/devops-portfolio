import Image from "next/image";
import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Mail,
  MapPin,
} from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { writeups } from "@/data/writeups";

const projects = [
  {
    title: "ECS Blue/Green Deployment",
    category: "AWS / Deployment Engineering",
    description:
      "A container deployment platform built on AWS ECS Fargate, with blue/green deployments, automated CI/CD and infrastructure managed through Terraform.",
    technologies: [
      "AWS ECS",
      "Terraform",
      "GitHub Actions",
      "Docker",
    ],
    image: "/architecture.png",
    href: "/projects/ecs-v2",
    github:
      "https://github.com/Mohamed-Abdullahi1/ecs-blue-green-platform",
  },
  {
    title: "Kubernetes on Amazon EKS",
    category: "Kubernetes / Infrastructure",
    description:
      "A code-server platform deployed on Amazon EKS, with Kubernetes orchestration and infrastructure provisioned using Terraform.",
    technologies: ["Kubernetes", "Amazon EKS", "Terraform"],
    image: "/eks-platform-architecture-2.png",
    href: "/projects/eks",
    github:
      "https://github.com/Mohamed-Abdullahi1/codeserver-eks-platform",
  },
  {
    title: "Gatus on AWS ECS",
    category: "AWS / Monitoring",
    description:
      "A containerised monitoring application running on AWS ECS Fargate, with infrastructure provisioned using Terraform.",
    technologies: ["AWS ECS", "Fargate", "Terraform", "Docker"],
    image: "/architecture-diagram.png",
    href: "/projects/ecs",
    github:
      "https://github.com/Mohamed-Abdullahi1/gatus-ecs-project",
  },
];

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-[1440px] px-6 sm:px-10 lg:px-16 xl:px-20">
      {/* Navigation */}
      <header className="flex min-h-24 flex-wrap items-center justify-between gap-6 border-b border-white/10 py-6">
        <Link
          href="/"
          className="text-[15px] font-semibold tracking-[-0.035em] text-white"
        >
          Mohamed Abdullahi
          <span className="ml-1 text-neutral-500">.</span>
        </Link>

        <nav
          aria-label="Main navigation"
          className="flex items-center gap-6 text-[13px] text-neutral-400 sm:gap-9"
        >
          <a
            href="#projects"
            className="transition-colors hover:text-white"
          >
            Projects
          </a>

          <a
            href="#writeups"
            className="transition-colors hover:text-white"
          >
            Writing
          </a>

          <a
            href="#about"
            className="transition-colors hover:text-white"
          >
            About
          </a>

          <a
            href="#contact"
            className="transition-colors hover:text-white"
          >
            Contact
          </a>
        </nav>
      </header>

      {/* Hero */}
      <section className="border-b border-white/10 pb-12 pt-12 sm:pb-14 sm:pt-14 lg:pt-16">
        <div className="mb-7 flex flex-wrap items-center gap-x-5 gap-y-3">
          <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-neutral-400">
            DevOps Engineer
          </span>

          <span className="hidden h-px w-6 bg-white/15 sm:block" />

          <span className="inline-flex items-center gap-2 text-xs text-neutral-500">
            <MapPin size={13} strokeWidth={1.7} />
            London, United Kingdom
          </span>
        </div>

        <h1 className="max-w-[1100px] text-[clamp(3.5rem,8vw,7.5rem)] font-semibold leading-[1.02] tracking-[-0.075em] text-[#f5f5f5]">
          Building reliable
          <br />
          <span className="text-neutral-400">infrastructure.</span>
        </h1>

        <p className="mt-7 max-w-[650px] text-base leading-[1.9] text-neutral-400 sm:text-[18px]">
          I build and automate cloud infrastructure, with a focus on
          reliability, security and scalable systems.
        </p>

        {/* Social Links */}
        <div className="mt-8 flex flex-wrap items-center gap-x-10 gap-y-6">
          <a
            href="https://github.com/Mohamed-Abdullahi1"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-3 text-lg font-medium text-neutral-200 transition-colors hover:text-white"
          >
            <FaGithub size={24} />
            GitHub
            <ArrowUpRight
              size={17}
              className="text-neutral-500 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </a>

          <a
            href="https://www.linkedin.com/in/mohamed-abdullahi-28345231a"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-3 text-lg font-medium text-neutral-200 transition-colors hover:text-white"
          >
            <FaLinkedin size={24} />
            LinkedIn
            <ArrowUpRight
              size={17}
              className="text-neutral-500 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </a>

          <a
            href="mailto:mohamedabdullahisgf@gmail.com"
            className="group inline-flex items-center gap-3 text-lg font-medium text-neutral-200 transition-colors hover:text-white"
          >
            <Mail size={24} strokeWidth={1.8} />
            Email
            <ArrowUpRight
              size={17}
              className="text-neutral-500 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </a>
        </div>

        <a
          href="#projects"
          className="mt-10 inline-flex items-center gap-2 text-xs text-neutral-500 transition-colors hover:text-white"
        >
          Explore projects
          <ArrowDown size={14} />
        </a>
      </section>

      {/* Projects */}
      <section
        id="projects"
        className="scroll-mt-12 border-b border-white/10 py-16 sm:py-20"
      >
        <div className="mb-14">
          <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.16em] text-neutral-500">
            Projects
          </p>

          <h2 className="text-4xl font-semibold tracking-[-0.055em] text-white sm:text-5xl">
            Selected work.
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-x-8 gap-y-16 md:grid-cols-2">
          {projects.map((project, index) => {
            const featured = index === 0;

            return (
              <article
                key={project.title}
                className={`group min-w-0 ${
                  featured ? "md:col-span-2" : ""
                }`}
              >
                <Link
                  href={project.href}
                  aria-label={`View ${project.title} case study`}
                  className="relative block overflow-hidden border border-white/10 bg-[#101010] transition-colors duration-300 hover:border-white/25"
                >
                  <div
                    className={`relative w-full ${
                      featured
                        ? "h-[280px] sm:h-[380px] lg:h-[500px]"
                        : "h-[250px] sm:h-[300px] lg:h-[350px]"
                    }`}
                  >
                    <Image
                      src={project.image}
                      alt={`${project.title} architecture diagram`}
                      fill
                      priority={featured}
                      sizes={
                        featured
                          ? "(max-width: 768px) 100vw, 1200px"
                          : "(max-width: 768px) 100vw, 600px"
                      }
                      className="object-contain p-5 transition-transform duration-500 group-hover:scale-[1.025] motion-reduce:transform-none sm:p-10"
                    />
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 flex items-center justify-end border-t border-white/10 bg-[#101010]/95 px-5 py-3">
                    <span className="inline-flex items-center gap-2 text-xs text-neutral-400">
                      View case study
                      <ArrowUpRight
                        size={14}
                        className="transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      />
                    </span>
                  </div>
                </Link>

                <div className="mt-6">
                  <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.12em] text-neutral-500">
                    {project.category}
                  </p>

                  <Link
                    href={project.href}
                    className="inline-flex items-center gap-3 text-2xl font-semibold tracking-[-0.04em] text-white transition-colors hover:text-neutral-300 sm:text-[28px]"
                  >
                    {project.title}
                    <ArrowUpRight
                      size={19}
                      className="shrink-0 text-neutral-500"
                    />
                  </Link>

                  <p className="mt-3 max-w-2xl text-sm leading-7 text-neutral-400">
                    {project.description}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {project.technologies.map((technology) => (
                      <span
                        key={technology}
                        className="border border-white/10 px-3 py-1.5 font-mono text-[10px] text-neutral-400"
                      >
                        {technology}
                      </span>
                    ))}
                  </div>

                  <div className="mt-6 flex items-center gap-6">
                    <Link
                      href={project.href}
                      className="inline-flex items-center gap-2 text-sm font-medium text-neutral-200 transition-colors hover:text-white"
                    >
                      Case study
                      <ArrowRight size={15} />
                    </Link>

                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-neutral-500 transition-colors hover:text-white"
                    >
                      <FaGithub size={15} />
                      Source code
                    </a>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* About */}
      <section
        id="about"
        className="scroll-mt-12 grid gap-10 border-b border-white/10 py-24 sm:py-28 lg:grid-cols-[1fr_2fr]"
      >
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-neutral-500">
            About
          </p>
        </div>

        <div>
          <h2 className="max-w-3xl text-3xl font-medium leading-[1.35] tracking-[-0.045em] text-neutral-200 sm:text-4xl">
            Good infrastructure should be{" "}
            <span className="text-neutral-500">
              repeatable, observable and built to withstand failure.
            </span>
          </h2>

          <p className="mt-8 max-w-2xl text-sm leading-8 text-neutral-400 sm:text-base">
            My work focuses on the engineering decisions behind cloud
            platforms: how infrastructure is provisioned, how changes
            reach production and how systems remain secure and
            maintainable.
          </p>

          <p className="mt-5 max-w-2xl text-sm leading-8 text-neutral-400 sm:text-base">
            Through hands-on projects, I explore cloud platforms,
            Kubernetes, Terraform and CI/CD, documenting the challenges,
            trade-offs and lessons along the way.
          </p>
        </div>
      </section>

      {/* Write-ups */}
      <section
        id="writeups"
        className="scroll-mt-12 border-b border-white/10 py-16 sm:py-20"
      >
        <div className="mb-14 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.16em] text-neutral-500">
              Engineering notes
            </p>

            <h2 className="text-4xl font-semibold tracking-[-0.055em] text-white sm:text-5xl">
              Writing.
            </h2>
          </div>

          <Link
            href="/writeups"
            className="group inline-flex items-center gap-2 text-sm text-neutral-400 transition-colors hover:text-white"
          >
            All write-ups
            <ArrowUpRight
              size={16}
              className="transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </Link>
        </div>

        <div className="border-t border-white/15">
          {writeups.map((article) => (
            <Link
              key={article.slug}
              href={`/writeups/${article.slug}`}
              className="group flex flex-col gap-5 border-b border-white/10 py-8 transition-colors hover:bg-white/[0.015] sm:flex-row sm:items-start sm:justify-between sm:py-10"
            >
              <div className="max-w-3xl">
                <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.12em] text-neutral-500">
                  {article.category}
                </p>

                <h3 className="text-xl font-medium tracking-[-0.035em] text-neutral-200 transition-colors group-hover:text-white sm:text-2xl">
                  {article.title}
                </h3>

                <p className="mt-3 max-w-2xl text-sm leading-7 text-neutral-500">
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

      {/* Contact */}
      <section
        id="contact"
        className="scroll-mt-12 py-24 sm:py-32"
      >
        <p className="mb-7 font-mono text-[11px] uppercase tracking-[0.16em] text-neutral-500">
          Contact
        </p>

        <div className="flex flex-col justify-between gap-12 lg:flex-row lg:items-end">
          <div>
            <h2 className="text-[clamp(3.5rem,8vw,7rem)] font-semibold leading-[1.05] tracking-[-0.075em] text-white">
              Let&apos;s connect.
            </h2>

            <p className="mt-7 max-w-lg text-base leading-8 text-neutral-400">
              Open to DevOps engineering opportunities, collaboration
              and technical discussions.
            </p>
          </div>

                    <div className="flex flex-wrap items-center gap-8">
            <a
              href="mailto:mohamedabdullahisgf@gmail.com"
              className="group inline-flex items-center gap-3 border-b border-neutral-400 pb-3 text-lg font-medium text-white transition-colors hover:border-white"
            >
              Get in touch
              <ArrowUpRight
                size={22}
                className="transition-transform duration-200 group-hover:-translate-y-1 group-hover:translate-x-1"
              />
            </a>

            <a
              href="https://www.linkedin.com/in/mohamed-abdullahi-28345231a"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-3 border-b border-neutral-400 pb-3 text-lg font-medium text-white transition-colors hover:border-white"
            >
              <FaLinkedin size={21} />
              LinkedIn
              <ArrowUpRight
                size={22}
                className="transition-transform duration-200 group-hover:-translate-y-1 group-hover:translate-x-1"
              />
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="flex flex-col gap-5 border-t border-white/10 py-8 text-xs text-neutral-500 sm:flex-row sm:items-center sm:justify-between">
        <span>© Mohamed Abdullahi</span>

        <div className="flex flex-wrap items-center gap-6">
          <a
            href="https://github.com/Mohamed-Abdullahi1"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-white"
          >
            GitHub
          </a>

          <a
            href="https://www.linkedin.com/in/mohamed-abdullahi-28345231a"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-white"
          >
            LinkedIn
          </a>

          <Link
            href="/writeups"
            className="transition-colors hover:text-white"
          >
            Writing
          </Link>

          <span>London, UK</span>
        </div>
      </footer>
    </main>
  );
}