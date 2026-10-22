export type CaseStudy = {
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

export const projects: Record<string, CaseStudy> = {
  "ecs-v2": {
    title: "ECS Blue/Green Deployment Platform",
    subtitle:
      "A multi-service application platform on AWS ECS Fargate, featuring automated infrastructure, native canary deployments and tested automatic rollback.",
    category: "AWS / DevOps / CI/CD",
    year: "2026",
    github:
      "https://github.com/Mohamed-Abdullahi1/ecs-blue-green-platform",
    image: "/architecture.png",

    technologies: [
      "AWS ECS",
      "AWS Fargate",
      "Terraform",
      "GitHub Actions",
      "Docker",
      "Amazon RDS",
      "Amazon ElastiCache",
      "Amazon SQS",
      "AWS WAF",
      "CloudWatch",
      "OIDC",
      "Amazon ECR",
    ],

    overview: [
      "I built a multi-service URL shortening platform on Amazon ECS Fargate, with infrastructure provisioned through Terraform and application delivery automated using GitHub Actions.",
      "The platform consists of a React frontend, a FastAPI API, a background worker processing asynchronous click events through Amazon SQS, and an analytics dashboard. PostgreSQL provides persistent storage, while Redis supports caching.",
      "The central engineering focus was deployment reliability: introducing application changes gradually, monitoring their health and automatically recovering when a release fails.",
    ],

    challenge: [
      "A deployment pipeline is only reliable if it can detect a faulty release and recover without leaving the application in an unhealthy state.",
      "I needed to combine progressive traffic shifting, meaningful health checks and automatic rollback while maintaining secure CI/CD authentication and reproducible infrastructure.",
      "The platform also required private application networking, controlled access to AWS services and an infrastructure lifecycle that would allow the environment to be recreated without extensive manual configuration.",
    ],

    architecture: [
      {
        title: "Application services",
        description:
          "Four independent services provide the frontend, URL shortening API, asynchronous event processing and analytics dashboard. ECS Fargate runs the containerised workloads.",
      },
      {
        title: "Networking and security",
        description:
          "A custom multi-AZ VPC isolates application workloads in private subnets. An internet-facing Application Load Balancer handles ingress, with AWS WAF and ACM protecting the public entry point.",
      },
      {
        title: "Data and messaging",
        description:
          "Amazon RDS for PostgreSQL stores persistent application data, ElastiCache Redis provides caching, and Amazon SQS decouples click-event processing from API requests.",
      },
      {
        title: "Infrastructure automation",
        description:
          "Terraform provisions the networking, compute, databases, messaging, IAM and supporting AWS resources through reusable modules. Remote state is stored in Amazon S3.",
      },
      {
        title: "Continuous delivery",
        description:
          "GitHub Actions builds, scans and publishes container images to Amazon ECR. OIDC provides temporary AWS credentials without storing long-lived access keys.",
      },
      {
        title: "Deployment reliability",
        description:
          "Native ECS canary deployments initially shift 10% of production traffic to a new task revision. CloudWatch deployment alarms support automatic rollback when health checks fail.",
      },
    ],

    implementation: [
      {
        title: "Designing the application architecture",
        description: [
          "I separated the platform into independently deployed services rather than placing the entire application inside one container. The API handles URL shortening and redirects, while a worker processes click events asynchronously through SQS.",
          "PostgreSQL provides durable storage, with Redis used for caching. This separation keeps background processing outside the request path and gives each service a clearly defined responsibility.",
        ],
      },
      {
        title: "Provisioning private infrastructure with Terraform",
        description: [
          "Terraform provisions the custom VPC, ECS services, Application Load Balancer, RDS, ElastiCache, SQS, IAM, WAF and supporting resources across multiple Availability Zones.",
          "Application workloads run in private subnets. I used VPC endpoints instead of NAT Gateways to provide private connectivity to supported AWS services while reducing networking costs.",
          "The infrastructure can be created and destroyed on demand, which was important for controlling the cost of a development environment.",
        ],
      },
      {
        title: "Implementing native ECS canary deployments",
        description: [
          "I configured native Amazon ECS canary deployments to direct 10% of production traffic to a replacement task revision before promoting the release.",
          "The deployment uses a five-minute bake period, allowing health signals to be evaluated before the remaining traffic is shifted.",
          "CloudWatch deployment alarms are integrated with the release process so an unhealthy revision can trigger automatic rollback to the previous healthy version.",
        ],
      },
      {
        title: "Validating automatic rollback",
        description: [
          "I tested the recovery mechanism by deliberately modifying the application's /healthz endpoint to return an unhealthy response during deployment.",
          "The new revision entered the canary phase, but its failing ALB health checks caused the associated CloudWatch alarm to enter the ALARM state.",
          "Amazon ECS cancelled the deployment and restored traffic to the previous healthy revision without manual intervention. This verified the rollback behaviour under an intentionally introduced failure.",
        ],
      },
      {
        title: "Securing and automating CI/CD",
        description: [
          "GitHub Actions automates container builds, vulnerability scanning, image publishing and infrastructure deployment. The container build workflow uses a matrix strategy to build the API, worker and dashboard images.",
          "AWS authentication uses OIDC role assumption instead of static IAM access keys. Configuring the trust relationship required debugging GitHub identity claims and ensuring that AWS accepted only the intended workflow identity.",
          "Trivy scans container images, while pre-commit checks include Gitleaks and Terraform validation. Application containers run as non-root users.",
        ],
      },
    ],

    lessons: [
      "Deployment reliability needs to be tested through failure, not inferred from successful releases.",
      "A canary rollout reduces exposure to a faulty revision, but its effectiveness depends on the health signals used to evaluate the deployment.",
      "Separating API requests from asynchronous event processing creates clearer service boundaries.",
      "OIDC removes the need for static CI/CD credentials, while IAM trust policies determine which workflows can assume a role.",
      "Infrastructure design involves trade-offs between security, availability, reproducibility and operating cost.",
    ],

    conclusion:
      "The most valuable part of this project was validating the deployment recovery path. Building the infrastructure and automating releases established the platform; deliberately introducing a failure demonstrated how it behaves when a deployment goes wrong.",
  },

  eks: {
    title: "GitOps Kubernetes Platform on AWS EKS",
    subtitle:
      "A GitOps-managed Kubernetes platform with automated infrastructure, secure workload identities, DNS, TLS, persistent storage and observability.",
    category: "Kubernetes / GitOps / Platform Engineering",
    year: "2026",
    github:
      "https://github.com/Mohamed-Abdullahi1/codeserver-eks-platform",
    image: "/eks-platform-architecture-2.png",

    technologies: [
      "Amazon EKS",
      "Kubernetes",
      "Terraform",
      "ArgoCD",
      "Helm",
      "GitHub Actions",
      "Traefik",
      "ExternalDNS",
      "cert-manager",
      "EKS Pod Identity",
      "Prometheus",
      "Grafana",
      "Docker",
    ],

    overview: [
      "I built a GitOps-managed Kubernetes platform on Amazon EKS, using Terraform to provision the AWS infrastructure and ArgoCD to manage Kubernetes resources declaratively.",
      "The platform hosts code-server, a browser-accessible development environment, behind an AWS Network Load Balancer and Traefik ingress controller. ExternalDNS manages Route 53 records, while cert-manager automates TLS certificate issuance through Let's Encrypt.",
      "The wider platform includes persistent EBS storage, workload-level IAM access through EKS Pod Identity, GitHub Actions CI/CD and observability through Prometheus and Grafana.",
    ],

    challenge: [
      "The main challenge was building a reproducible Kubernetes environment in which infrastructure provisioning, platform bootstrap and ongoing workload management had clearly defined responsibilities.",
      "GitOps introduces a bootstrap dependency: ArgoCD cannot manage the cluster until the cluster exists and ArgoCD itself has been installed.",
      "The platform also needed secure AWS access for Kubernetes components, reliable persistent storage and a teardown process capable of removing AWS resources created dynamically by Kubernetes controllers.",
    ],

    architecture: [
      {
        title: "Infrastructure and compute",
        description:
          "Terraform provisions a multi-AZ VPC, EKS cluster, managed node groups and IAM resources. Worker nodes and application workloads run in private subnets.",
      },
      {
        title: "GitOps control plane",
        description:
          "Helm bootstraps ArgoCD, after which the App-of-Apps pattern manages platform components and application resources through continuous reconciliation from Git.",
      },
      {
        title: "Ingress and DNS",
        description:
          "Traffic reaches the cluster through an internet-facing Network Load Balancer and Traefik. ExternalDNS reconciles Route 53 records from Kubernetes resources.",
      },
      {
        title: "TLS and storage",
        description:
          "cert-manager automates Let's Encrypt certificates. The AWS EBS CSI driver dynamically provisions persistent volumes for workloads that require storage.",
      },
      {
        title: "Identity and delivery",
        description:
          "EKS Pod Identity provides scoped AWS permissions to cluster components. GitHub Actions uses OIDC for infrastructure workflows and publishes scanned container images to ECR.",
      },
      {
        title: "Observability",
        description:
          "Prometheus and Grafana, deployed through kube-prometheus-stack, provide visibility into cluster and workload metrics.",
      },
    ],

    implementation: [
      {
        title: "Separating infrastructure provisioning from GitOps",
        description: [
          "Terraform provisions the underlying AWS infrastructure, including networking, EKS, IAM and supporting services. Remote state is stored in S3 using native state locking.",
          "I used Helm to bootstrap ArgoCD once the cluster was available, then applied the root application to establish the App-of-Apps structure.",
          "From that point, ArgoCD reconciles the platform's Kubernetes resources against their configuration in Git, reducing the need for manual changes inside the cluster.",
        ],
      },
      {
        title: "Automating application access and HTTPS",
        description: [
          "The application is exposed through Traefik behind an AWS Network Load Balancer. ExternalDNS manages the corresponding Route 53 records, while cert-manager requests and renews certificates from Let's Encrypt.",
          "This allows application routing, DNS and TLS configuration to be managed through Kubernetes resources instead of separate manual deployment steps.",
        ],
      },
      {
        title: "Resolving persistent storage provisioning failures",
        description: [
          "I encountered dynamic EBS volume provisioning failures because the cluster did not have the required default gp3 storage class configuration.",
          "I addressed the storage configuration by deploying the AWS EBS CSI driver, configuring EKS Pod Identity for its AWS permissions and using the CSI-based provisioner instead of the deprecated in-tree approach.",
          "This established dynamic persistent volume provisioning for the code-server workload.",
        ],
      },
      {
        title: "Implementing workload-level AWS permissions",
        description: [
          "I configured EKS Pod Identity so components such as ExternalDNS and the EBS CSI driver could use dedicated IAM roles.",
          "This avoids depending on broad node-level AWS permissions and allows access to be scoped according to each component's responsibilities.",
          "GitHub Actions separately uses OIDC federation for AWS access during infrastructure and image delivery workflows.",
        ],
      },
      {
        title: "Building the CI/CD and GitOps workflow",
        description: [
          "GitHub Actions runs Terraform formatting, validation, Checkov security analysis and infrastructure planning. Infrastructure changes are applied through an OIDC-authenticated workflow.",
          "Application changes trigger Docker image builds and Trivy scanning before images are pushed to Amazon ECR.",
          "The pipeline updates the image reference in the deployment manifests, allowing ArgoCD to detect the Git change and reconcile the new application version.",
        ],
      },
      {
        title: "Handling infrastructure teardown",
        description: [
          "Kubernetes controllers can create AWS resources that are not directly represented as Terraform-managed resources. These need to be considered before destroying the underlying cluster.",
          "I implemented a dedicated teardown workflow that cleans up Kubernetes-created AWS resources before running Terraform destroy.",
          "This made it possible to remove the environment when it was not needed, reducing the risk of leaving chargeable infrastructure behind.",
        ],
      },
    ],

    lessons: [
      "GitOps requires a deliberate bootstrap process before the GitOps controller can manage the platform.",
      "Persistent storage depends on the interaction between Kubernetes storage resources, CSI drivers and AWS permissions.",
      "Pod Identity provides a clearer boundary between Kubernetes workloads and their required AWS permissions.",
      "Automated DNS and TLS reduce manual configuration but introduce controllers whose behaviour must be understood.",
      "Reliable infrastructure teardown is part of platform engineering, particularly when Kubernetes creates cloud resources dynamically.",
    ],

    conclusion:
      "This project brought together infrastructure provisioning, Kubernetes operations and GitOps into one platform. Resolving the storage issue and designing the bootstrap and teardown workflows were particularly valuable because they required understanding how Kubernetes controllers interact with AWS infrastructure.",
  },

  ecs: {
    title: "Gatus Monitoring on ECS Fargate",
    subtitle:
      "A secure monitoring deployment on AWS ECS Fargate, with automated CI/CD, private networking and a 97.6% reduction in container image size.",
    category: "AWS / Monitoring / Containers",
    year: "2026",
    github:
      "https://github.com/Mohamed-Abdullahi1/gatus-ecs-project",
    image: "/architecture-diagram.png",

    technologies: [
      "AWS ECS",
      "AWS Fargate",
      "Gatus",
      "Terraform",
      "Docker",
      "GitHub Actions",
      "Amazon ECR",
      "Trivy",
      "OIDC",
      "Route 53",
      "AWS ACM",
    ],

    overview: [
      "I deployed Gatus, an open-source endpoint monitoring application, on Amazon ECS Fargate using Terraform-managed infrastructure and automated GitHub Actions pipelines.",
      "The application runs in private subnets across two Availability Zones, behind an Application Load Balancer. Route 53 provides DNS, while AWS Certificate Manager enables HTTPS.",
      "Beyond deploying the monitoring service, I focused on container optimisation, secure networking and automating the complete infrastructure lifecycle.",
    ],

    challenge: [
      "The project required a monitoring application that could be deployed consistently without exposing its containers directly to the internet.",
      "The original single-stage Docker image was approximately 2.45 GB because it included build dependencies and tooling that were unnecessary at runtime.",
      "I also needed to automate image delivery and infrastructure changes while keeping AWS credentials out of the CI/CD configuration.",
    ],

    architecture: [
      {
        title: "Monitoring workload",
        description:
          "Gatus runs on ECS Fargate and evaluates configured endpoints, providing visibility into uptime, response times and service health.",
      },
      {
        title: "Private networking",
        description:
          "ECS tasks run without public IP addresses in private subnets across two Availability Zones. Security groups restrict application ingress to the ALB security group.",
      },
      {
        title: "Public access",
        description:
          "Route 53 directs traffic to an internet-facing Application Load Balancer. ACM provides HTTPS, with HTTP requests redirected to HTTPS.",
      },
      {
        title: "Infrastructure automation",
        description:
          "Terraform provisions the VPC, ECS services, load balancer, certificates and DNS resources. Remote state is stored in S3 with locking.",
      },
      {
        title: "Container delivery",
        description:
          "GitHub Actions builds and scans the Docker image, pushes it to Amazon ECR and deploys infrastructure changes using OIDC-authenticated AWS access.",
      },
      {
        title: "Infrastructure lifecycle",
        description:
          "Separate build, deployment and destroy workflows support repeatable releases and allow the AWS environment to be removed when it is no longer required.",
      },
    ],

    implementation: [
      {
        title: "Reducing Docker image size by 97.6%",
        description: [
          "The original single-stage Docker image was approximately 2.45 GB, including build tooling and dependencies that were not needed by the running application.",
          "I replaced it with a multi-stage build that separates compilation from the final runtime image, reducing the image size to approximately 58 MB.",
          "The final container also runs as a non-root user, with file ownership configured to provide only the permissions needed at runtime.",
        ],
      },
      {
        title: "Designing secure AWS networking",
        description: [
          "I provisioned a multi-AZ VPC with public and private subnets. The Application Load Balancer handles incoming traffic, while ECS Fargate tasks remain isolated in private subnets.",
          "Security groups use security-group references so application tasks accept inbound traffic from the ALB rather than from unrestricted public CIDR ranges.",
          "A NAT Gateway provides outbound connectivity for private workloads, while Route 53 and ACM provide custom-domain access over HTTPS.",
        ],
      },
      {
        title: "Automating build and deployment",
        description: [
          "GitHub Actions builds the container image, runs Trivy vulnerability scanning and pushes the resulting image to Amazon ECR.",
          "A separate deployment workflow applies Terraform changes, with infrastructure configuration and image references supplied through pipeline variables.",
          "OIDC allows the workflows to obtain temporary AWS credentials without storing static IAM access keys in GitHub.",
        ],
      },
      {
        title: "Managing infrastructure with Terraform",
        description: [
          "Terraform modules manage the VPC, ALB, ECS, ACM and Route 53 resources. Infrastructure state is stored remotely in S3 using native locking.",
          "The project includes dedicated workflows for deploying and destroying the environment, making it possible to reproduce the infrastructure and remove resources when they are no longer needed.",
        ],
      },
      {
        title: "Monitoring endpoint health",
        description: [
          "Gatus provides visibility into endpoint availability, response times and configured health conditions through its monitoring interface.",
          "The monitoring workload demonstrates an important operational distinction: an application can be running while its dependencies or externally visible endpoints are unhealthy.",
          "The project focuses on endpoint monitoring rather than presenting Gatus as a replacement for a full metrics, logging and tracing platform.",
        ],
      },
    ],

    lessons: [
      "Multi-stage Docker builds can substantially reduce runtime image size by excluding build-only dependencies.",
      "Private subnets and security-group references provide clearer control over application exposure.",
      "OIDC-based CI/CD authentication avoids storing long-lived AWS access keys.",
      "Container vulnerability scanning adds a security check before images enter the deployment process.",
      "Infrastructure teardown should be automated alongside deployment, especially for environments that incur ongoing cloud costs.",
    ],

    conclusion:
      "The most significant improvement was reducing the container image from approximately 2.45 GB to 58 MB. Combined with private networking, automated delivery and reproducible infrastructure, the project demonstrated how deployment engineering can improve the security and efficiency of a relatively small application.",
  },
};