import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  Code2,
  Lightbulb,
  Layers3,
  ShieldCheck,
  Wrench,
} from "lucide-react";

type CaseStudy = {
  title: string;
  subtitle: string;
  category: string;
  year: string;
  github: string;
  image: string;
  technologies: string[];
  overview: string[];
  challenge: string[];
  architecture: {
    title: string;
    description: string;
  }[];
  implementation: {
    title: string;
    description: string[];
  }[];
  lessons: string[];
  conclusion: string;
};

const projects: Record<string, CaseStudy> = {
  "ecs-v2": {
    title: "ECS Blue/Green Deployment Platform",
    subtitle:
      "Building a containerised application platform with infrastructure as code, automated delivery and a safer deployment process.",
    category: "AWS / DevOps / CI/CD",
    year: "2026",
    github:
      "https://github.com/Mohamed-Abdullahi1/ecs-blue-green-platform",
    image: "/architecture.png",

    technologies: [
      "AWS ECS",
      "AWS Fargate",
      "Terraform",
      "Docker",
      "GitHub Actions",
      "AWS IAM",
      "OIDC",
      "Amazon ECR",
      "Application Load Balancer",
    ],

    overview: [
      "This project centres on a containerised URL shortener deployed to Amazon ECS Fargate. The application provides a practical workload for exploring the engineering challenges involved in delivering changes to cloud infrastructure.",
      "Rather than focusing exclusively on application development, I concentrated on the surrounding platform: provisioning AWS resources with Terraform, automating container builds, securing CI/CD authentication and implementing a deployment process designed around controlled releases.",
      "The objective was to build a platform that could be reproduced, maintained and investigated when something went wrong.",
    ],

    challenge: [
      "Deploying a container is relatively straightforward. Deploying it reliably introduces several additional concerns.",
      "A new application version can pass its initial health checks while still introducing failures. CI/CD workflows require access to cloud infrastructure, but storing long-lived AWS credentials creates unnecessary security risks. Infrastructure also needs to be reproducible without depending on manual configuration.",
      "The challenge was to bring these concerns together into a coherent deployment platform rather than treating them as unrelated configuration tasks.",
    ],

    architecture: [
      {
        title: "Container runtime",
        description:
          "Amazon ECS Fargate runs the application containers without requiring direct management of EC2 worker instances.",
      },
      {
        title: "Traffic management",
        description:
          "An Application Load Balancer provides the entry point to the application and supports routing traffic to the deployed workloads.",
      },
      {
        title: "Infrastructure as code",
        description:
          "Terraform defines the AWS infrastructure, making resource configuration reviewable and repeatable.",
      },
      {
        title: "Container registry",
        description:
          "Amazon ECR stores the Docker images produced by the build pipeline.",
      },
      {
        title: "Continuous integration and delivery",
        description:
          "GitHub Actions automates build and deployment activities, connecting repository changes to the delivery workflow.",
      },
      {
        title: "Cloud authentication",
        description:
          "GitHub Actions uses OIDC-based role assumption to obtain temporary AWS credentials rather than relying on stored IAM access keys.",
      },
    ],

    implementation: [
      {
        title: "Provisioning the platform with Terraform",
        description: [
          "I used Terraform to describe the AWS infrastructure required by the application. This separated infrastructure configuration from the application itself and reduced reliance on manual console changes.",
          "Terraform planning also provided a way to inspect proposed infrastructure changes before applying them.",
          "For a portfolio environment, reproducibility was particularly important because cloud resources could be removed when not in use and recreated when needed.",
        ],
      },
      {
        title: "Containerising the application",
        description: [
          "The URL shortener runs as a Docker container. Containerisation provides a consistent application artefact that can move through the build and deployment process.",
          "The image is built and published to Amazon ECR, where it can be referenced by the ECS deployment.",
          "This separates the process of producing an application image from the process of running it.",
        ],
      },
      {
        title: "Building the CI/CD pipeline",
        description: [
          "GitHub Actions connects source changes to automated build and deployment tasks.",
          "The pipeline became an important part of the project because it introduced practical problems involving container image builds, security scanning and AWS authentication.",
          "Working through these issues required understanding the behaviour of individual tools rather than simply relying on a successful workflow run.",
        ],
      },
      {
        title: "Securing AWS authentication with OIDC",
        description: [
          "Instead of storing long-lived AWS access keys in GitHub, I used OIDC to authenticate the workflow with AWS.",
          "This required configuring the IAM trust relationship between GitHub's identity provider and the AWS role.",
          "One of the more challenging parts of the project involved debugging OIDC identity claims. It reinforced the distinction between a workflow being able to request an identity token and AWS actually trusting that identity.",
        ],
      },
      {
        title: "Designing controlled deployments",
        description: [
          "The deployment design uses blue/green principles to separate the existing application version from its replacement.",
          "A canary-style rollout provides a way to introduce the replacement gradually instead of directing all traffic to it immediately.",
          "This introduces an important operational question: what evidence should determine whether a deployment continues or is rolled back?",
          "Health checks, application error rates and deployment alarms are all relevant, but each provides a different level of confidence.",
        ],
      },
      {
        title: "Investigating security scanning failures",
        description: [
          "While improving the container build pipeline, I encountered vulnerability-scanning issues and worked through base-image changes.",
          "Some of the investigation involved how software bill of materials data was handled by the scanning tool.",
          "The experience highlighted the importance of distinguishing genuine vulnerability findings from scanner behaviour and build configuration problems.",
        ],
      },
    ],

    lessons: [
      "A healthy container does not necessarily mean the application is functioning correctly.",
      "OIDC authentication depends on matching identity claims against a deliberately scoped IAM trust policy.",
      "Infrastructure as code improves reproducibility, but infrastructure validation does not replace application testing.",
      "Deployment rollback depends on meaningful health signals and a reliable recovery path.",
      "Container image traceability is important when investigating failures and reverting releases.",
    ],

    conclusion:
      "This project strengthened my understanding of the systems surrounding application delivery. The most valuable work was not simply deploying a container, but connecting infrastructure automation, identity, CI/CD and deployment reliability into a single platform.",
  },

  eks: {
    title: "Kubernetes Code-Server Platform",
    subtitle:
      "Deploying a browser-based development environment on Amazon EKS while exploring Kubernetes networking, workload configuration and infrastructure automation.",
    category: "Kubernetes / AWS / Infrastructure",
    year: "2026",
    github:
      "https://github.com/Mohamed-Abdullahi1/codeserver-eks-platform",
    image: "/eks-platform-architecture-2.png",

    technologies: [
      "Kubernetes",
      "Amazon EKS",
      "Terraform",
      "Docker",
      "AWS",
      "Linux",
      "Networking",
      "Infrastructure as Code",
    ],

    overview: [
      "This project involved deploying code-server, a browser-accessible development environment, on Amazon Elastic Kubernetes Service.",
      "The application provided a useful workload for exploring Kubernetes beyond running a container locally. I needed to consider how the cluster was provisioned, how workloads were configured and how users would reach the application.",
      "The emphasis was on the infrastructure and operational decisions required to host an application on a managed Kubernetes platform.",
    ],

    challenge: [
      "Running a container locally hides much of the infrastructure involved in making an application available to users.",
      "On Kubernetes, the application becomes part of a larger system involving workloads, services, networking and cluster-level infrastructure.",
      "The challenge was to understand how those components fit together and how the AWS infrastructure supporting the cluster could be managed reproducibly.",
    ],

    architecture: [
      {
        title: "Managed Kubernetes control plane",
        description:
          "Amazon EKS provides the managed Kubernetes control plane, allowing workloads to be orchestrated through the Kubernetes API.",
      },
      {
        title: "Application workload",
        description:
          "Code-server runs as a containerised application within the Kubernetes environment.",
      },
      {
        title: "Kubernetes resources",
        description:
          "Kubernetes configuration defines the application's desired workload state and the resources required to expose it.",
      },
      {
        title: "AWS infrastructure",
        description:
          "The platform relies on AWS networking and cluster infrastructure to support the Kubernetes environment.",
      },
      {
        title: "Infrastructure automation",
        description:
          "Terraform provides a declarative approach to provisioning and managing the underlying infrastructure.",
      },
    ],

    implementation: [
      {
        title: "Provisioning Amazon EKS",
        description: [
          "I used Amazon EKS as the Kubernetes platform for the project.",
          "This introduced the distinction between managing the underlying cloud infrastructure and managing application workloads through Kubernetes.",
          "The cluster needed the appropriate networking, permissions and compute configuration before application resources could be deployed.",
        ],
      },
      {
        title: "Deploying code-server",
        description: [
          "Code-server provides a development environment accessible through a web browser.",
          "Deploying it to Kubernetes required defining how the application should run inside the cluster and how Kubernetes should maintain its desired state.",
          "This provided practical experience with the relationship between container images, workload definitions and running Pods.",
        ],
      },
      {
        title: "Understanding Kubernetes networking",
        description: [
          "A running Pod is not automatically reachable from outside the cluster.",
          "Kubernetes networking introduces an additional layer between the application and its users.",
          "Working with these concepts helped reinforce the distinction between an application's internal container port, the Kubernetes resources exposing it and the infrastructure providing external connectivity.",
        ],
      },
      {
        title: "Separating infrastructure from workloads",
        description: [
          "Terraform and Kubernetes solve different problems within the platform.",
          "Terraform provisions and manages cloud infrastructure, while Kubernetes reconciles application workloads against their declared configuration.",
          "Understanding that separation helped establish a clearer mental model of how the platform operates.",
        ],
      },
      {
        title: "Considering operational cost",
        description: [
          "Amazon EKS introduces ongoing infrastructure costs, including the managed cluster and supporting resources.",
          "For a portfolio project, that makes teardown and resource lifecycle management important considerations.",
          "The objective is to demonstrate the architecture without assuming that the entire environment must remain online permanently.",
        ],
      },
    ],

    lessons: [
      "Kubernetes manages application workloads, but the surrounding infrastructure still requires deliberate design.",
      "A running Pod does not automatically mean an application is accessible to users.",
      "Kubernetes networking becomes easier to understand when the responsibilities of Pods, Services and external infrastructure are separated.",
      "Infrastructure automation helps make managed Kubernetes environments reproducible.",
      "Operational cost should influence how development and portfolio environments are managed.",
    ],

    conclusion:
      "The code-server platform helped me develop a more practical understanding of Kubernetes on AWS. It connected container orchestration with cloud infrastructure and reinforced the importance of understanding how applications are deployed, exposed and maintained.",
  },

  ecs: {
    title: "Gatus Monitoring on ECS Fargate",
    subtitle:
      "Deploying a lightweight service-monitoring application on AWS using containerisation and infrastructure automation.",
    category: "AWS / Monitoring / Containers",
    year: "2026",
    github:
      "https://github.com/Mohamed-Abdullahi1/gatus-ecs-project",
    image: "/architecture-diagram.png",

    technologies: [
      "AWS ECS",
      "AWS Fargate",
      "Gatus",
      "Docker",
      "Terraform",
      "AWS",
      "Monitoring",
    ],

    overview: [
      "This project focused on deploying Gatus, an open-source service-health monitoring application, to Amazon ECS Fargate.",
      "Gatus can evaluate configured endpoints and display their health through a web interface. It provides a lightweight way to monitor whether services respond as expected.",
      "The project combined a monitoring workload with the infrastructure required to run it in AWS, giving me practical experience with container deployment and infrastructure automation.",
    ],

    challenge: [
      "A service being deployed does not mean it will remain available or continue responding correctly.",
      "Without monitoring, failures may go unnoticed until someone attempts to use the application.",
      "The challenge was to deploy a monitoring service that could evaluate endpoint health while also managing the infrastructure required to host the monitoring application itself.",
    ],

    architecture: [
      {
        title: "Monitoring application",
        description:
          "Gatus evaluates configured service endpoints and presents their health status.",
      },
      {
        title: "Container runtime",
        description:
          "Amazon ECS Fargate provides the runtime environment for the monitoring container.",
      },
      {
        title: "Infrastructure",
        description:
          "AWS resources provide the networking and compute environment required by the application.",
      },
      {
        title: "Infrastructure automation",
        description:
          "Terraform makes the supporting infrastructure reproducible.",
      },
      {
        title: "Endpoint health checks",
        description:
          "Gatus can evaluate response conditions such as HTTP status codes and response times, depending on its configuration.",
      },
    ],

    implementation: [
      {
        title: "Choosing Gatus",
        description: [
          "Gatus is designed around service-health monitoring rather than being a full metrics and observability platform.",
          "It provides a straightforward way to define endpoints and evaluate whether their responses satisfy configured conditions.",
          "That made it a suitable application for exploring how a monitoring service could be hosted on AWS.",
        ],
      },
      {
        title: "Running the application in a container",
        description: [
          "Containerisation packages the monitoring application and its runtime dependencies into a deployable artefact.",
          "Amazon ECS Fargate then runs the container without requiring direct management of the underlying EC2 instances.",
          "This allowed me to focus on the workload configuration and AWS infrastructure rather than server administration.",
        ],
      },
      {
        title: "Provisioning the AWS environment",
        description: [
          "Terraform provides a declarative way to manage the resources required by the application.",
          "Keeping infrastructure configuration in code makes it easier to review changes, reproduce the environment and understand how the components relate to one another.",
        ],
      },
      {
        title: "Understanding health checks",
        description: [
          "A health check is only useful when it measures something meaningful.",
          "A successful HTTP response might demonstrate that an endpoint is reachable, but it does not necessarily prove that every application function works.",
          "Gatus provides a practical starting point for endpoint monitoring, while also highlighting the difference between availability checks and deeper application observability.",
        ],
      },
      {
        title: "Thinking about monitoring reliability",
        description: [
          "Hosting a monitoring service introduces its own operational considerations.",
          "If the monitoring application becomes unavailable, that does not necessarily mean the monitored services are unhealthy.",
          "This distinction is important when designing alerting and interpreting monitoring failures.",
        ],
      },
    ],

    lessons: [
      "Monitoring should evaluate meaningful service behaviour rather than merely checking whether a process exists.",
      "Endpoint health checks and full application observability are different capabilities.",
      "Containerisation makes monitoring applications easier to package and deploy consistently.",
      "Infrastructure as code improves repeatability and reduces reliance on manual configuration.",
      "A monitoring platform has its own availability and operational requirements.",
    ],

    conclusion:
      "Deploying Gatus on ECS Fargate provided practical experience with AWS container infrastructure while introducing important monitoring concepts. The project reinforced that running a service and understanding its health are two separate engineering responsibilities.",
  },
};

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