import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Clock3 } from "lucide-react";
import { writeups } from "@/data/writeups";

type Block =
  | { type: "p"; text: string }
  | { type: "heading"; text: string }
  | { type: "subheading"; text: string }
  | { type: "code"; language: string; text: string }
  | { type: "note"; text: string };

type Article = {
  blocks: Block[];
  repo?: string;
};

const articles: Record<string, Article> = {
  "gitops-bootstrap-trap": {
    blocks: [
      {
        type: "p",
        text: "Every GitOps adoption eventually runs into the same question: if ArgoCD manages everything, who manages ArgoCD?",
      },
      {
        type: "p",
        text: "At first, this looks like a deployment-order problem. Provision a Kubernetes cluster, install ArgoCD, point it towards Git and let the controller handle everything else. But the interesting problem appears when another tool still believes it owns the resources ArgoCD has started reconciling.",
      },
      {
        type: "p",
        text: "Terraform, Helm and ArgoCD all have their own models of desired state. They are individually useful, but they do not share a single ownership model. When their responsibilities overlap, a successful initial deployment can turn into an ongoing operational problem.",
      },
      {
        type: "p",
        text: "The difficult part is not necessarily getting ArgoCD installed. It is deciding which system has authority over a resource after installation, and what happens when that authority needs to change.",
      },
      {
        type: "p",
        text: "In my EKS platform project, I used Terraform to provision the AWS infrastructure and Helm to bootstrap ArgoCD. Once ArgoCD was running, I used the App-of-Apps pattern to reconcile platform components from Git. This established a clear separation between provisioning the underlying cluster and managing the Kubernetes workloads running inside it.",
      },

      {
        type: "heading",
        text: "The bootstrap paradox",
      },
      {
        type: "p",
        text: "GitOps is built around a relatively straightforward idea: define the desired state of a system in Git, then use a controller to reconcile the actual state against it. ArgoCD provides that reconciliation mechanism for Kubernetes.",
      },
      {
        type: "p",
        text: "Once configured, ArgoCD can detect differences between live Kubernetes resources and the configuration stored in a repository. Depending on the Application's synchronisation policy, it can apply changes automatically or wait for an engineer to approve them.",
      },
      {
        type: "p",
        text: "But a newly provisioned EKS cluster does not have an ArgoCD controller waiting to read a repository. There is no Application controller, no reconciliation process and no mechanism for installing the first set of GitOps-managed resources.",
      },
      {
        type: "p",
        text: "Something outside ArgoCD must perform that initial installation. This could be a Helm command, Terraform's Helm provider or a dedicated bootstrap workflow executed through CI/CD.",
      },
      {
        type: "p",
        text: "None of these approaches is inherently wrong. The important decision is what happens after the controller becomes operational. Does the bootstrap mechanism retain ownership, or does responsibility move to ArgoCD?",
      },
      {
        type: "note",
        text: "Bootstrapping is an initial dependency problem. Conflicting ownership is an ongoing reconciliation problem. Treating them as the same issue makes the latter considerably harder to diagnose.",
      },

      {
        type: "heading",
        text: "Where Terraform fits into the picture",
      },
      {
        type: "p",
        text: "Terraform is a natural choice for provisioning foundational AWS infrastructure. Networking, IAM roles, security groups, EKS clusters and supporting services can all be defined declaratively and managed through Terraform state.",
      },
      {
        type: "p",
        text: "Once the cluster exists and is accessible, Terraform can also interact with Kubernetes through its providers. A common approach is to use the Helm provider to install ArgoCD.",
      },
      {
        type: "code",
        language: "Terraform",
        text: `resource "helm_release" "argocd" {
  name             = "argocd"
  repository       = "https://argoproj.github.io/argo-helm"
  chart            = "argo-cd"
  namespace        = "argocd"
  create_namespace = true

  version = var.argocd_chart_version
}`,
      },
      {
        type: "p",
        text: "This configuration establishes a Terraform-managed Helm release. Terraform records the relationship between the resource address in its configuration and the release in the cluster.",
      },
      {
        type: "p",
        text: "Future Terraform plans can then compare the configured release against the state Terraform knows about and propose changes when necessary.",
      },
      {
        type: "p",
        text: "Installing ArgoCD this way is not itself a problem. The difficulty begins when ArgoCD is subsequently configured to manage the same Helm release or overlapping Kubernetes resources.",
      },
      {
        type: "p",
        text: "Terraform may expect one chart version, set of values or collection of metadata. ArgoCD may expect another. Both systems now have instructions to enforce their own understanding of the desired state.",
      },

      {
        type: "heading",
        text: "When reconciliation becomes a tug of war",
      },
      {
        type: "p",
        text: "Imagine Terraform installs a platform component with configuration A. Later, an ArgoCD Application is created to manage that component using configuration B stored in Git.",
      },
      {
        type: "p",
        text: "ArgoCD compares the live resource against its desired configuration and detects a difference. It synchronises the resource to match Git.",
      },
      {
        type: "p",
        text: "The next Terraform plan identifies that the infrastructure no longer matches Terraform's configuration. An engineer applies the plan, restoring configuration A.",
      },
      {
        type: "p",
        text: "ArgoCD then detects the same difference again.",
      },
      {
        type: "code",
        language: "Reconciliation sequence",
        text: `Terraform applies configuration A
               |
               v
ArgoCD compares live state with configuration B
               |
               v
ArgoCD synchronises configuration B
               |
               v
Terraform detects a difference
               |
               v
Terraform reapplies configuration A
               |
               v
ArgoCD reports OutOfSync again`,
      },
      {
        type: "p",
        text: "Neither system is necessarily malfunctioning. Terraform is enforcing its configuration when an apply occurs. ArgoCD is reconciling against the desired state defined in Git.",
      },
      {
        type: "p",
        text: "The architectural mistake is that two systems have been given competing authority over the same resources.",
      },
      {
        type: "p",
        text: "Repeatedly running terraform apply or forcing an ArgoCD synchronisation may temporarily change the resource's state, but it does not resolve the underlying conflict.",
      },
      {
        type: "note",
        text: "It is not a sequencing problem. It is an ownership problem.",
      },

      {
        type: "heading",
        text: "The Helm release that already exists",
      },
      {
        type: "p",
        text: "There is a related failure mode that appears when a Helm release already exists in the cluster, but Terraform does not track it in state.",
      },
      {
        type: "p",
        text: "Suppose ArgoCD was installed manually using Helm. Later, a Terraform configuration is introduced containing a helm_release resource with the same release name and namespace.",
      },
      {
        type: "p",
        text: "Terraform does not automatically adopt every existing resource that happens to match its configuration. If it has no state relationship with the existing Helm release, it may attempt to create another release.",
      },
      {
        type: "p",
        text: "This can produce an error such as:",
      },
      {
        type: "code",
        language: "Error",
        text: "cannot re-use a name that is still in use",
      },
      {
        type: "p",
        text: "The error does not necessarily indicate that the Helm chart is broken or that Kubernetes cannot run the application. It may indicate that Helm already knows about a release with the requested name.",
      },
      {
        type: "p",
        text: "This is where the distinction between infrastructure existing and infrastructure being tracked becomes important.",
      },
      {
        type: "p",
        text: "A Terraform resource declaration describes what Terraform should manage. Terraform state establishes the relationship between that declaration and an existing infrastructure object.",
      },
      {
        type: "p",
        text: "Before deleting anything, the first step should be to investigate which releases exist, which resources Terraform tracks and whether ArgoCD is managing any of the same objects.",
      },
      {
        type: "code",
        language: "Bash",
        text: `helm list -A

terraform state list

kubectl get applications.argoproj.io -A`,
      },
      {
        type: "p",
        text: "Deleting an existing release simply to make Terraform apply successfully can introduce downtime and may leave the original ownership problem unresolved.",
      },

      {
        type: "heading",
        text: "Import before apply",
      },
      {
        type: "p",
        text: "If the architectural decision is that Terraform should manage an existing Helm release, importing it into Terraform state can establish the missing relationship.",
      },
      {
        type: "p",
        text: "The process begins by inspecting the existing release and defining a Terraform resource that represents it. The release can then be imported before attempting to apply configuration changes.",
      },
      {
        type: "code",
        language: "Bash",
        text: `terraform import helm_release.argocd argocd/argocd

terraform plan`,
      },
      {
        type: "p",
        text: "The example uses the conventional namespace/release-name import format. The exact syntax should be verified against the Helm provider version being used.",
      },
      {
        type: "p",
        text: "Importing is not the end of the process. It is essential to inspect the subsequent Terraform plan.",
      },
      {
        type: "p",
        text: "Terraform may propose an upgrade, configuration change or replacement because the imported release does not match the declared resource configuration.",
      },
      {
        type: "p",
        text: "A successful import followed by an unexpected destructive plan is not a successful migration.",
      },
      {
        type: "p",
        text: "There is also an important limitation: import is appropriate when Terraform is intended to become the owner. It does not resolve a situation where Terraform and ArgoCD are both supposed to manage the same resource indefinitely.",
      },
      {
        type: "p",
        text: "If ownership is moving to ArgoCD instead, the migration needs a different approach. Terraform's management of the resource must be relinquished deliberately without accidentally destroying the underlying infrastructure.",
      },

      {
        type: "heading",
        text: "Why ArgoCD keeps reporting OutOfSync",
      },
      {
        type: "p",
        text: "An ArgoCD Application reporting OutOfSync is a symptom rather than a diagnosis.",
      },
      {
        type: "p",
        text: "It means ArgoCD has identified a difference between the desired configuration and the live Kubernetes resources. That difference could come from several places.",
      },
      {
        type: "p",
        text: "It might be a genuine configuration change. It might be a default value added by Kubernetes, a mutation performed by an admission webhook, metadata introduced by another tool or an external controller modifying fields after deployment.",
      },
      {
        type: "p",
        text: "Helm ownership annotations are particularly relevant when investigating resources managed through Helm.",
      },
      {
        type: "code",
        language: "YAML",
        text: `metadata:
  annotations:
    meta.helm.sh/release-name: argocd
    meta.helm.sh/release-namespace: argocd`,
      },
      {
        type: "p",
        text: "These annotations help Helm identify the release associated with particular resources. Differences involving ownership metadata can become relevant when tools attempt to adopt or manage existing objects.",
      },
      {
        type: "p",
        text: "Kubernetes managedFields can also help reveal which managers have written particular fields. However, they should not automatically be blamed for every ArgoCD synchronisation difference.",
      },
      {
        type: "p",
        text: "The correct investigation starts with the actual diff.",
      },
      {
        type: "code",
        language: "Bash",
        text: `argocd app get <application-name>

argocd app diff <application-name>

kubectl get deployment <name> \\
  -n <namespace> -o yaml

helm status <release-name> \\
  -n <namespace>`,
      },
      {
        type: "p",
        text: "These commands help establish what ArgoCD expects, what Kubernetes currently contains and whether Helm is involved in managing the resource.",
      },
      {
        type: "p",
        text: "One tempting response is to add ignoreDifferences rules until ArgoCD reports that everything is synchronised.",
      },
      {
        type: "p",
        text: "Ignoring known controller-managed fields can be appropriate. But suppressing differences before understanding their cause can conceal an actual ownership conflict.",
      },
      {
        type: "p",
        text: "The objective should not be to make the dashboard green. It should be to establish a predictable source of truth.",
      },

      {
        type: "heading",
        text: "Drawing a clear ownership boundary",
      },
      {
        type: "p",
        text: "A useful approach is to divide the platform into infrastructure ownership and application ownership.",
      },
      {
        type: "p",
        text: "Terraform manages foundational AWS resources: networking, IAM, EKS and other infrastructure components whose lifecycle is closely connected to the underlying cloud environment.",
      },
      {
        type: "p",
        text: "ArgoCD manages Kubernetes applications and platform components that have deliberately been placed under GitOps.",
      },
      {
        type: "p",
        text: "Terraform may still manage selected Kubernetes resources, including bootstrap components. The important requirement is that ownership is explicit rather than accidental.",
      },
      {
        type: "code",
        language: "Ownership model",
        text: `Terraform
   |
   +-- VPC and networking
   +-- IAM and security
   +-- EKS cluster
   +-- Node infrastructure
   +-- Explicit bootstrap resources
                |
                v
           ArgoCD
                |
                v
         Git repository
                |
                +-- Applications
                +-- Services
                +-- Ingress resources
                +-- Platform workloads`,
      },
      {
        type: "p",
        text: "This separation is not a universal rule that Terraform must never interact with Kubernetes. Real platforms often have components that span cloud infrastructure and Kubernetes resources.",
      },
      {
        type: "p",
        text: "The point is to avoid giving two independent reconciliation systems conflicting instructions for the same objects.",
      },
      {
        type: "p",
        text: "Ownership decisions should also be documented. Engineers need to know which tool should be used to modify a resource, how upgrades are performed and what should happen when drift is detected.",
      },

      {
        type: "heading",
        text: "Can ArgoCD manage itself?",
      },
      {
        type: "p",
        text: "Once ArgoCD has been bootstrapped, it can manage its own configuration through GitOps.",
      },
      {
        type: "p",
        text: "This provides the familiar benefits of declarative configuration: version control, reviewable changes and a consistent delivery process.",
      },
      {
        type: "p",
        text: "However, self-management creates an operational dependency worth understanding.",
      },
      {
        type: "p",
        text: "Suppose a configuration change breaks ArgoCD itself. The controller responsible for applying the correction may no longer be available.",
      },
      {
        type: "p",
        text: "That does not make self-management inherently unsafe. It means the platform needs a recovery mechanism that does not depend entirely on the controller remaining operational.",
      },
      {
        type: "p",
        text: "An engineer should know how to restore a known-good configuration using an appropriate out-of-band mechanism, such as Helm or kubectl, while respecting the platform's ownership model.",
      },
      {
        type: "p",
        text: "The same principle applies to upgrades. A declarative upgrade process is useful, but the ability to recover from a failed controller upgrade is equally important.",
      },

      {
        type: "heading",
        text: "The real lesson",
      },
      {
        type: "p",
        text: "The interesting part of GitOps is not simply that a controller can apply YAML from a repository.",
      },
      {
        type: "p",
        text: "It is the operational contract behind that reconciliation: which system owns each resource, what constitutes drift, how ownership changes and how the platform recovers when the controller itself fails.",
      },
      {
        type: "p",
        text: "Terraform, Helm and ArgoCD can work together effectively. But their responsibilities need to be designed rather than discovered through repeated deployment failures.",
      },
      {
        type: "note",
        text: "The difficult part is not getting the first apply to succeed. It is establishing authority clearly before the first reconciliation loop runs.",
      },
    ],
  },

  "ecs-blue-green-deployments": {
    repo: "https://github.com/Mohamed-Abdullahi1/ecs-blue-green-platform",
    blocks: [
      {
        type: "p",
        text: "A container starting successfully is not the same thing as a deployment succeeding. That distinction shaped my ECS blue/green project: a URL shortener running on AWS, surrounded by the infrastructure, pipeline and operational controls needed to release changes more safely.",
      },
      {
        type: "p",
        text: "The application gave me something concrete to deploy. The engineering work was in what happened around it: provisioning the environment with Terraform, building and scanning images, authenticating GitHub Actions with AWS, shifting traffic and deciding what should happen when a new version behaved badly.",
      },
      {
        type: "p",
        text: "The project became less about getting containers to run and more about understanding the systems responsible for delivering changes safely.",
      },

      {
        type: "heading",
        text: "Why an ordinary container update wasn't enough",
      },
      {
        type: "p",
        text: "The simplest deployment flow builds a new Docker image, pushes it to a registry and updates the running ECS service. ECS starts tasks using the replacement image and manages their lifecycle.",
      },
      {
        type: "p",
        text: "That is useful automation, but it does not tell you whether the new release is safe for real traffic.",
      },
      {
        type: "p",
        text: "An application can pass a health check while its core business operation is broken. For a URL shortener, a basic HTTP endpoint might respond normally while link creation or redirect resolution fails.",
      },
      {
        type: "p",
        text: "Health checks, application tests and production metrics answer different questions. None should automatically be treated as a substitute for the others.",
      },
      {
        type: "p",
        text: "I wanted the release process to recognise that difference. Instead of equating task readiness with success, the design needed a way to expose the replacement version to traffic, observe it and retain a path back to the previous version.",
      },
      {
        type: "note",
        text: "A successful deployment needs more evidence than a running container. It needs meaningful signals that the replacement version is behaving as expected.",
      },

      {
        type: "heading",
        text: "The architecture behind the release",
      },
      {
        type: "p",
        text: "Amazon ECS Fargate provides the container runtime. Rather than managing EC2 worker instances directly, the platform defines the container requirements and lets Fargate provide the underlying compute.",
      },
      {
        type: "p",
        text: "An Application Load Balancer provides the entry point and traffic-routing layer. Terraform defines the supporting AWS resources, while GitHub Actions connects source-code changes to the build and deployment workflow.",
      },
      {
        type: "p",
        text: "Amazon ECR stores the container images produced by the pipeline. IAM roles control which components can interact with AWS services.",
      },
      {
        type: "code",
        language: "Architecture overview",
        text: `GitHub repository
       |
       v
GitHub Actions ---- OIDC ---- AWS IAM / STS
       |
       v
Build and scan container image
       |
       v
Amazon ECR
       |
       v
ECS Fargate deployment
       |
       v
Application Load Balancer
       |
       +-- Existing application version
       |
       +-- Replacement application version`,
      },
      {
        type: "p",
        text: "The repository contains the fuller infrastructure implementation and architecture diagram.",
      },
      {
        type: "p",
        text: "The important architectural separation is between provisioning the platform, producing a deployable artefact and controlling how that artefact reaches users.",
      },
      {
        type: "p",
        text: "Each component has a different responsibility. Understanding those boundaries becomes particularly important when a deployment fails.",
      },

      {
        type: "heading",
        text: "Making infrastructure reproducible with Terraform",
      },
      {
        type: "p",
        text: "Using Terraform turned AWS configuration into something I could review and reproduce. Networking, IAM and ECS-related resources could be described in code instead of being assembled through a sequence of console clicks.",
      },
      {
        type: "p",
        text: "That matters for troubleshooting because a proposed infrastructure change becomes visible before it reaches AWS.",
      },
      {
        type: "code",
        language: "Bash",
        text: `terraform fmt -check

terraform validate

terraform plan`,
      },
      {
        type: "p",
        text: "These commands serve different purposes. Formatting checks consistency, validation checks the structure of the configuration, and planning evaluates the changes Terraform expects to make.",
      },
      {
        type: "p",
        text: "None of these checks proves that the application will work after deployment.",
      },
      {
        type: "p",
        text: "A reliable delivery process needs to separate infrastructure correctness from application behaviour. Terraform can show that an ECS service or load balancer will be modified, but it cannot guarantee that the replacement application will handle requests correctly.",
      },
      {
        type: "p",
        text: "Infrastructure as code also made teardown part of the development process.",
      },
      {
        type: "p",
        text: "Fargate, load balancing, networking and other AWS services can generate costs even when a portfolio application receives little traffic. Repeatability is valuable partly because it allows the environment to be recreated without keeping every resource running indefinitely.",
      },

      {
        type: "heading",
        text: "Making the container artefact traceable",
      },
      {
        type: "p",
        text: "A deployment pipeline should make it possible to answer a deceptively simple question: exactly which image is running?",
      },
      {
        type: "p",
        text: "A mutable tag such as latest is convenient, but it is not a reliable historical record of a release. The same tag can point to different image contents over time.",
      },
      {
        type: "p",
        text: "Image digests provide content-addressed references. Commit-specific identifiers can also help connect source revisions to build outputs.",
      },
      {
        type: "p",
        text: "This becomes important during rollback. Reverting to a tag that has since moved may not restore the version you intended.",
      },
      {
        type: "code",
        language: "Bash",
        text: `docker image inspect \\
  --format='{{index .RepoDigests 0}}' \\
  <image-reference>`,
      },
      {
        type: "p",
        text: "The command illustrates how to inspect a local image's repository digest when one is available.",
      },
      {
        type: "p",
        text: "The broader principle is to preserve traceability between the source revision, container image and deployed workload.",
      },
      {
        type: "p",
        text: "A pipeline that reports success without making the deployed artefact identifiable creates unnecessary uncertainty when investigating incidents.",
      },

      {
        type: "heading",
        text: "GitHub Actions without long-lived AWS keys",
      },
      {
        type: "p",
        text: "The CI/CD pipeline needed permission to interact with AWS. A traditional approach would involve storing an IAM user's access key ID and secret access key in GitHub repository secrets.",
      },
      {
        type: "p",
        text: "Instead, I used GitHub Actions with OIDC authentication.",
      },
      {
        type: "p",
        text: "This allows the workflow to request an identity token from GitHub and exchange it for temporary AWS credentials through Security Token Service, provided the IAM role's trust conditions are satisfied.",
      },
      {
        type: "code",
        language: "GitHub Actions YAML",
        text: `permissions:
  contents: read
  id-token: write

steps:
  - name: Configure AWS credentials
    uses: aws-actions/configure-aws-credentials@v4
    with:
      role-to-assume: \${{ secrets.AWS_ROLE_ARN }}
      aws-region: eu-west-2`,
      },
      {
        type: "p",
        text: "This is an illustrative workflow fragment rather than a claim that the repository currently contains these exact lines.",
      },
      {
        type: "p",
        text: "The workflow permission allows GitHub to issue an OIDC token. AWS access still depends on the IAM trust policy and the permissions associated with the role.",
      },
      {
        type: "p",
        text: "That distinction became particularly important when I started debugging identity claims.",
      },

      {
        type: "heading",
        text: "The OIDC failure that forced me to look deeper",
      },
      {
        type: "p",
        text: "During the project, I encountered problems while investigating GitHub's OIDC identity claims.",
      },
      {
        type: "p",
        text: "The tempting response to an authentication failure is to keep changing IAM permissions or workflow configuration until the request succeeds.",
      },
      {
        type: "p",
        text: "But an OIDC failure can occur before AWS even evaluates the permissions the assumed role would grant.",
      },
      {
        type: "p",
        text: "The important detail is the identity GitHub presents.",
      },
      {
        type: "p",
        text: "An OIDC token contains claims describing its issuer, audience and execution context. AWS evaluates relevant claims against conditions in the IAM role's trust policy.",
      },
      {
        type: "p",
        text: "If the subject does not match the trusted repository, branch or environment context, STS can deny role assumption even when the workflow has permission to request an identity token.",
      },
      {
        type: "code",
        language: "Example OIDC subjects",
        text: `repo:example-org/example-repo:ref:refs/heads/main

repo:example-org/example-repo:environment:production`,
      },
      {
        type: "p",
        text: "The subject can change depending on the workflow context and GitHub's OIDC configuration.",
      },
      {
        type: "p",
        text: "Investigating the claims helped me understand that authentication is not a single checkbox.",
      },
      {
        type: "p",
        text: "GitHub must issue the expected identity. AWS must trust that identity. The resulting role must then have the appropriate permissions for the requested operation.",
      },
      {
        type: "note",
        text: "When role assumption fails, establish whether the problem is token issuance, trust-policy matching or AWS permissions. They are different failure points and require different fixes.",
      },

      {
        type: "heading",
        text: "Introducing traffic gradually",
      },
      {
        type: "p",
        text: "The deployment design used blue/green concepts with canary traffic shifting.",
      },
      {
        type: "p",
        text: "Rather than immediately directing every request to the replacement application version, a canary configuration can introduce the new version to a smaller percentage of traffic.",
      },
      {
        type: "p",
        text: "In the project design, the initial traffic shift was 10%, followed by a five-minute monitoring interval before continuing the rollout.",
      },
      {
        type: "p",
        text: "This provides an opportunity to observe the new version while the existing application continues serving most requests.",
      },
      {
        type: "p",
        text: "However, a monitoring window is only useful when meaningful signals are available.",
      },
      {
        type: "p",
        text: "Five minutes of observation might detect immediate startup failures or elevated HTTP error rates. It may not detect infrequently used application paths, gradual resource exhaustion or problems that only appear under sustained load.",
      },
      {
        type: "p",
        text: "The exact traffic-shifting and rollback behaviour depends on the ECS deployment controller and its configuration. Percentages alone do not guarantee a safe rollout.",
      },

      {
        type: "heading",
        text: "Testing rollback by deliberately breaking the application",
      },
      {
        type: "p",
        text: "I wanted to verify that the deployment system could recover from a failed release, rather than assume the rollback configuration would work.",
      },
      {
        type: "p",
        text: "To test this, I deliberately introduced a failure into the application's /healthz endpoint and deployed the broken revision through the pipeline.",
      },
      {
        type: "p",
        text: "The deployment configuration used a 10% canary traffic shift and a five-minute bake period. The Application Load Balancer's health checks detected the unhealthy application targets, causing the associated CloudWatch alarm to enter the ALARM state.",
      },
      {
        type: "p",
        text: "ECS responded by automatically rolling back the deployment to the previous healthy revision. This demonstrated that the deployment's failure-detection and recovery mechanisms were connected and functioning.",
      },
      {
        type: "code",
        language: "Rollback test",
        text: `Deploy revision with broken /healthz
                |
                v
ECS begins canary deployment
                |
                v
ALB detects unhealthy targets
                |
                v
CloudWatch alarm enters ALARM
                |
                v
ECS triggers automatic rollback
                |
                v
Previous healthy revision restored`,
      },
      {
        type: "p",
        text: "The experiment validated an important failure scenario: a replacement revision that could not satisfy the configured health checks. It did not prove that every application regression would be detected, particularly failures that leave /healthz responding successfully.",
      },
      {
        type: "note",
        text: "A rollback configuration is only a recovery mechanism on paper until it has been tested against a real failure.",
      },

      {
        type: "heading",
        text: "Rollback needs meaningful signals",
      },
      {
        type: "p",
        text: "Rollback is often described as a feature that can simply be enabled. The more difficult engineering decision is determining when it should happen.",
      },
      {
        type: "p",
        text: "A deployment system needs a definition of unacceptable behaviour.",
      },
      {
        type: "p",
        text: "That might include unhealthy load-balancer targets, elevated server error rates, failed application requests or another metric closely connected to application correctness.",
      },
      {
        type: "p",
        text: "CloudWatch alarms can participate in automated deployment decisions when integrated with the relevant deployment mechanism.",
      },
      {
        type: "p",
        text: "But the alarm configuration matters.",
      },
      {
        type: "p",
        text: "An alarm that is too sensitive can interrupt healthy deployments. An alarm that only detects complete service failure may miss serious application regressions.",
      },
      {
        type: "p",
        text: "There is also a distinction between reverting application traffic and reversing every consequence of a release.",
      },
      {
        type: "p",
        text: "Rolling back an application version does not automatically reverse database schema changes or undo data written by the new version.",
      },
      {
        type: "p",
        text: "As a platform becomes more stateful, compatibility between application versions and persistent data becomes part of deployment reliability.",
      },
      {
        type: "note",
        text: "Rollback is only as reliable as the monitoring signals, deployment mechanism and application compatibility assumptions supporting it.",
      },

      {
        type: "heading",
        text: "When container security checks complicate the pipeline",
      },
      {
        type: "p",
        text: "The project also involved investigating container vulnerabilities and security-scanning failures.",
      },
      {
        type: "p",
        text: "A Docker image can build successfully while containing vulnerable operating-system packages or application dependencies.",
      },
      {
        type: "p",
        text: "I worked through base-image updates and vulnerability-scanning issues while improving the pipeline.",
      },
      {
        type: "p",
        text: "Some of the debugging involved scanner handling of software bill of materials data embedded in image layers.",
      },
      {
        type: "p",
        text: "That required distinguishing between genuine vulnerability findings, dependency problems and the behaviour of the scanning tool itself.",
      },
      {
        type: "p",
        text: "Treating every failed security check as the same problem would have made troubleshooting less effective.",
      },
      {
        type: "p",
        text: "Updating a base image can address vulnerabilities, but it can also introduce compatibility changes. A security improvement still needs to be tested against the application's runtime behaviour.",
      },
      {
        type: "p",
        text: "The wider lesson was that build success, security assessment and runtime correctness are separate properties.",
      },

      {
        type: "heading",
        text: "The cost of production-style infrastructure",
      },
      {
        type: "p",
        text: "A platform can be technically sophisticated while still being unnecessarily expensive for its intended workload.",
      },
      {
        type: "p",
        text: "Fargate tasks, load balancers, networking and managed AWS services all introduce operational costs.",
      },
      {
        type: "p",
        text: "For a portfolio environment, running a complete production-style architecture continuously may provide little additional value.",
      },
      {
        type: "p",
        text: "Infrastructure teardown therefore becomes part of the development workflow.",
      },
      {
        type: "p",
        text: "Terraform helps make resource creation and removal repeatable, but it is still important to inspect the AWS account for resources that may remain after a destroy operation.",
      },
      {
        type: "p",
        text: "The broader lesson is that architecture always involves trade-offs.",
      },
      {
        type: "p",
        text: "Reliability, operational complexity and cost need to be considered together. Production-style engineering does not mean using every available cloud service. It means understanding why each component exists and what it costs to operate.",
      },

      {
        type: "heading",
        text: "What I took away",
      },
      {
        type: "p",
        text: "The most valuable part of building this platform was not learning how to launch containers on ECS.",
      },
      {
        type: "p",
        text: "It was learning how the surrounding systems influence whether a deployment is safe, reproducible and maintainable.",
      },
      {
        type: "p",
        text: "Terraform made infrastructure changes reviewable. GitHub Actions connected source control to deployment automation. OIDC introduced a more deliberate authentication boundary. ECS provided the runtime, while traffic shifting and monitoring shaped how releases could be evaluated.",
      },
      {
        type: "p",
        text: "The debugging work was particularly valuable because it forced me to understand why the system behaved a certain way rather than simply follow a configuration that happened to work.",
      },
      {
        type: "note",
        text: "Deployment engineering is not just about making releases faster. It is about making changes predictable, observable and recoverable.",
      },
    ],
  },

  "github-actions-oidc-security": {
    blocks: [
      {
        type: "p",
        text: "Your GitHub Actions workflow no longer stores AWS access keys. Instead, it uses OpenID Connect to request temporary credentials. That's a significant improvement. But does it actually mean your deployment pipeline is secure?",
      },
      {
        type: "p",
        text: "The answer depends on something that receives considerably less attention than removing secrets: the trust relationship between GitHub and AWS.",
      },
      {
        type: "p",
        text: "OIDC changes how a workflow authenticates, but it does not automatically establish which workflows should be authorised to access production infrastructure.",
      },
      {
        type: "p",
        text: "While working on my ECS deployment platform, I encountered problems involving GitHub's OIDC identity claims and AWS IAM trust policies. That experience raised a more interesting question: what exactly is AWS trusting when it accepts a token issued to a GitHub Actions job?",
      },

      {
        type: "heading",
        text: "The problem OIDC was designed to solve",
      },
      {
        type: "p",
        text: "Traditionally, CI/CD pipelines authenticated with AWS using an access key ID and secret access key belonging to an IAM user.",
      },
      {
        type: "p",
        text: "Those credentials could be stored in GitHub repository secrets and injected into a workflow whenever a deployment needed access to AWS.",
      },
      {
        type: "p",
        text: "Although GitHub encrypts repository secrets, long-lived credentials still create operational risks.",
      },
      {
        type: "p",
        text: "If credentials are exposed through a compromised workflow, an accidental log entry or another security failure, they may remain usable until explicitly revoked or rotated.",
      },
      {
        type: "p",
        text: "OIDC removes the need for this arrangement.",
      },
      {
        type: "p",
        text: "Instead of retrieving an existing AWS secret, a GitHub Actions job requests a short-lived identity token from GitHub's OIDC provider.",
      },
      {
        type: "p",
        text: "AWS Security Token Service evaluates the token against an IAM role's trust policy and, if the conditions are satisfied, issues temporary AWS credentials.",
      },
      {
        type: "code",
        language: "Authentication flow",
        text: `GitHub Actions job
        |
        v
Requests an OIDC token
        |
        v
GitHub OIDC identity provider
        |
        v
Signed identity token
        |
        v
AWS Security Token Service
        |
        v
IAM trust policy evaluation
        |
        +-- Denied
        |
        +-- Allowed
               |
               v
      Temporary AWS credentials`,
      },
      {
        type: "p",
        text: "The improvement is substantial. There is no persistent AWS access key to distribute to the workflow, and the credentials issued by AWS have a limited lifetime.",
      },
      {
        type: "p",
        text: "However, temporary credentials can still be misused during their validity period. Their short lifespan is one security control, not a complete authorisation model.",
      },
      {
        type: "note",
        text: "OIDC reduces the risk associated with long-lived credentials. It does not automatically reduce the permissions granted to a workflow or restrict which workflows AWS will trust.",
      },

      {
        type: "heading",
        text: "What AWS actually evaluates",
      },
      {
        type: "p",
        text: "When GitHub issues an OIDC token, it includes claims describing the identity and execution context of the requesting job.",
      },
      {
        type: "p",
        text: "These claims allow the receiving system to make decisions about whether that identity should be trusted.",
      },
      {
        type: "p",
        text: "For AWS IAM integrations, two particularly important claims are the audience and subject.",
      },
      {
        type: "p",
        text: "The audience identifies the intended recipient of the token. The subject describes the GitHub workflow context requesting access.",
      },
      {
        type: "p",
        text: "A conventional subject for a workflow running on the main branch might look like this:",
      },
      {
        type: "code",
        language: "OIDC subject",
        text: "repo:example-org/example-repo:ref:refs/heads/main",
      },
      {
        type: "p",
        text: "A job associated with a GitHub environment may instead present a subject resembling:",
      },
      {
        type: "code",
        language: "OIDC subject",
        text: "repo:example-org/example-repo:environment:production",
      },
      {
        type: "p",
        text: "These examples reflect conventional GitHub subject formats. GitHub also supports customised subject templates, so the actual token must be inspected rather than assumed.",
      },
      {
        type: "p",
        text: "The IAM role's trust policy determines whether AWS accepts the identity represented by those claims.",
      },
      {
        type: "p",
        text: "If the trust conditions are too broad, more workflow contexts may be authorised than intended. If they are too restrictive or do not match the actual token, legitimate deployments can fail.",
      },

      {
        type: "heading",
        text: "The repository-wide trust problem",
      },
      {
        type: "p",
        text: "Consider a repository containing several GitHub Actions workflows. One runs unit tests, another builds container images, and a third deploys the application to production.",
      },
      {
        type: "p",
        text: "Only the production deployment workflow should be able to assume a role with production deployment permissions.",
      },
      {
        type: "p",
        text: "But imagine the IAM role uses a wildcard that trusts every OIDC subject associated with the repository.",
      },
      {
        type: "code",
        language: "IAM trust policy condition",
        text: `{
  "Condition": {
    "StringEquals": {
      "token.actions.githubusercontent.com:aud":
        "sts.amazonaws.com"
    },
    "StringLike": {
      "token.actions.githubusercontent.com:sub":
        "repo:example-org/example-repo:*"
    }
  }
}`,
      },
      {
        type: "p",
        text: "This is an illustrative condition block, not a complete IAM role trust policy.",
      },
      {
        type: "p",
        text: "The wildcard allows multiple workflow contexts within the repository to match the subject condition.",
      },
      {
        type: "p",
        text: "That is broader than a policy intended to authorise only one production deployment path.",
      },
      {
        type: "p",
        text: "It does not mean every workflow automatically receives credentials. It means the trust condition itself may not distinguish between the contexts that matter.",
      },
      {
        type: "p",
        text: "The problem is not that the token is fake or that AWS STS is insecure.",
      },
      {
        type: "p",
        text: "The problem is that the organisation has described an overly broad set of identities as trusted.",
      },
      {
        type: "note",
        text: "Temporary credentials do not compensate for a trust policy that authorises the wrong identities.",
      },

      {
        type: "heading",
        text: "Authentication and authorisation are different",
      },
      {
        type: "p",
        text: "An OIDC token establishes information about the identity and context of a requesting workflow.",
      },
      {
        type: "p",
        text: "It does not automatically establish that the workflow should be permitted to deploy production infrastructure.",
      },
      {
        type: "p",
        text: "AWS IAM separates these concerns.",
      },
      {
        type: "p",
        text: "The role's trust policy determines which principals can assume the role. Its permissions policies determine what those principals can do after assuming it.",
      },
      {
        type: "p",
        text: "Both decisions matter.",
      },
      {
        type: "p",
        text: "Imagine an IAM role that can update a production ECS service.",
      },
      {
        type: "p",
        text: "Even if its permissions are carefully restricted to that deployment operation, it is dangerous if unintended workflows can assume it.",
      },
      {
        type: "p",
        text: "Equally, a narrowly restricted trust policy does not make a role safe if the resulting session receives unnecessarily broad administrative permissions.",
      },
      {
        type: "p",
        text: "The identity allowed to assume a role and the actions permitted after assumption are separate parts of the same security boundary.",
      },

      {
        type: "heading",
        text: "Restricting the deployment context",
      },
      {
        type: "p",
        text: "If the intended deployment identity is a conventional main-branch context, a stricter trust condition can require that exact subject.",
      },
      {
        type: "code",
        language: "IAM JSON — branch restriction",
        text: `{
  "Condition": {
    "StringEquals": {
      "token.actions.githubusercontent.com:aud":
        "sts.amazonaws.com",
      "token.actions.githubusercontent.com:sub":
        "repo:example-org/example-repo:ref:refs/heads/main"
    }
  }
}`,
      },
      {
        type: "p",
        text: "This narrows the set of workflow contexts that can assume the role.",
      },
      {
        type: "p",
        text: "However, a branch restriction is not necessarily a workflow restriction.",
      },
      {
        type: "p",
        text: "Multiple workflows may run on the same branch. If an attacker can modify a workflow on that branch or otherwise cause an authorised context to execute malicious steps, the branch condition alone is not a complete defence.",
      },
      {
        type: "p",
        text: "Repository write permissions, branch protection, code review and control over workflow changes therefore become part of the AWS security model, even though those controls exist on GitHub's side of the integration.",
      },
      {
        type: "p",
        text: "The security of a deployment role depends partly on the security of the repository and workflow configuration permitted to assume it.",
      },

      {
        type: "heading",
        text: "Why protected environments help",
      },
      {
        type: "p",
        text: "GitHub environments provide another mechanism for controlling deployment workflows.",
      },
      {
        type: "p",
        text: "A production environment can be configured with deployment restrictions and approval requirements, depending on the repository's available GitHub features.",
      },
      {
        type: "p",
        text: "When a job uses an environment, its conventional OIDC subject can reflect that environment.",
      },
      {
        type: "p",
        text: "AWS can then restrict role assumption to the expected environment subject.",
      },
      {
        type: "code",
        language: "IAM JSON — environment restriction",
        text: `{
  "Condition": {
    "StringEquals": {
      "token.actions.githubusercontent.com:aud":
        "sts.amazonaws.com",
      "token.actions.githubusercontent.com:sub":
        "repo:example-org/example-repo:environment:production"
    }
  }
}`,
      },
      {
        type: "p",
        text: "That condition should be paired with appropriate GitHub environment protection settings.",
      },
      {
        type: "p",
        text: "Merely naming an environment production does not make it protected.",
      },
      {
        type: "p",
        text: "The value comes from combining GitHub's controls over who can reach that environment with AWS's restriction on which environment identity it accepts.",
      },
      {
        type: "p",
        text: "Neither side should be evaluated in isolation.",
      },

      {
        type: "heading",
        text: "What about individual workflow identity?",
      },
      {
        type: "p",
        text: "For some organisations, even an environment-based subject may be too broad.",
      },
      {
        type: "p",
        text: "A repository may contain several workflows capable of targeting the same environment, while only a centrally reviewed deployment workflow should receive production credentials.",
      },
      {
        type: "p",
        text: "GitHub supports customising OIDC subject claims, including designs involving reusable workflows and workflow identity.",
      },
      {
        type: "p",
        text: "These controls can help distinguish an approved deployment workflow from other jobs sharing a repository, branch or environment.",
      },
      {
        type: "p",
        text: "The precise claim template and IAM condition must be validated against the actual GitHub and AWS integration rather than assumed.",
      },
      {
        type: "p",
        text: "The design principle is straightforward: if the security requirement names a particular workflow, the trust boundary should ideally be able to identify that workflow rather than merely the repository containing it.",
      },

      {
        type: "heading",
        text: "The GitHub permission people misunderstand",
      },
      {
        type: "p",
        text: "A GitHub Actions job needs permission to request an OIDC identity token.",
      },
      {
        type: "code",
        language: "GitHub Actions YAML",
        text: `permissions:
  contents: read
  id-token: write`,
      },
      {
        type: "p",
        text: "The id-token: write permission allows the job to request an identity token from GitHub.",
      },
      {
        type: "p",
        text: "It does not itself grant AWS access.",
      },
      {
        type: "p",
        text: "AWS must still decide whether the token satisfies the IAM role's trust policy.",
      },
      {
        type: "p",
        text: "This distinction becomes useful when troubleshooting authentication failures.",
      },
      {
        type: "p",
        text: "If the workflow cannot request a token, the issue may involve GitHub Actions permissions.",
      },
      {
        type: "p",
        text: "If the workflow can request a token but cannot assume the AWS role, the issue may involve token claims or IAM trust conditions.",
      },
      {
        type: "p",
        text: "If role assumption succeeds but an ECS or ECR operation fails, that is a different authorisation problem involving the role's permissions or another AWS control.",
      },
      {
        type: "p",
        text: "Treating these as separate failure points makes debugging more systematic.",
      },

      {
        type: "heading",
        text: "Least privilege is the second half of the boundary",
      },
      {
        type: "p",
        text: "A narrowly written trust policy can still introduce excessive risk if the assumed role has administrator-level permissions.",
      },
      {
        type: "p",
        text: "A workflow responsible for pushing images to ECR does not automatically need permission to modify networking, IAM or databases.",
      },
      {
        type: "p",
        text: "Likewise, an application release workflow and a Terraform infrastructure workflow may deserve separate IAM roles.",
      },
      {
        type: "p",
        text: "Separating responsibilities makes mistakes easier to contain.",
      },
      {
        type: "p",
        text: "If a build workflow is compromised, its credentials should not provide a general-purpose route to production infrastructure.",
      },
      {
        type: "p",
        text: "Temporary credentials limit how long a credential remains usable. Least privilege limits what that credential can do.",
      },
      {
        type: "p",
        text: "Both controls are necessary because they address different dimensions of risk.",
      },

      {
        type: "heading",
        text: "How I would validate the trust boundary",
      },
      {
        type: "p",
        text: "A trust policy is more convincing when both the expected successful and expected denied cases have been tested.",
      },
      {
        type: "p",
        text: "I would start with an isolated test repository and an AWS IAM role with minimal permissions.",
      },
      {
        type: "p",
        text: "The objective would be to compare role assumption from different branches, environments and workflow contexts without giving the test role access to production infrastructure.",
      },
      {
        type: "p",
        text: "The first test would use a broad repository subject. Subsequent tests would narrow the subject to a particular branch or protected environment.",
      },
      {
        type: "p",
        text: "For each run, I would record the workflow context, expected result and whether STS accepted the token.",
      },
      {
        type: "p",
        text: "A successful session could be identified using:",
      },
      {
        type: "code",
        language: "Bash",
        text: "aws sts get-caller-identity",
      },
      {
        type: "p",
        text: "This command reports the AWS identity associated with the active credentials.",
      },
      {
        type: "p",
        text: "It does not prove that the identity has permission to deploy infrastructure. That separation is useful because the trust boundary can be investigated without granting the test workflow unnecessary privileges.",
      },
      {
        type: "p",
        text: "This describes a proposed validation method rather than completed experimental results.",
      },
      {
        type: "p",
        text: "The important idea is to verify not only that an authorised workflow can assume the role, but that unauthorised workflow contexts are denied.",
      },

      {
        type: "heading",
        text: "The security improvement that actually matters",
      },
      {
        type: "p",
        text: "OIDC removes an important class of credential-management risk.",
      },
      {
        type: "p",
        text: "It does not remove the need to think about who can edit workflows, which execution contexts may request tokens, how AWS evaluates identity claims and what permissions the resulting session receives.",
      },
      {
        type: "p",
        text: "A deployment pipeline is only as secure as the combined trust boundary between its source-control system, identity provider and cloud environment.",
      },
      {
        type: "p",
        text: "The question I would ask during a pipeline review is not simply whether access keys have been removed.",
      },
      {
        type: "p",
        text: "I would ask whether a workflow that should not deploy can nevertheless satisfy the role's trust conditions, and whether anyone has tested that it cannot.",
      },
      {
        type: "note",
        text: "A secure pipeline does not merely use short-lived credentials. It makes the identities allowed to receive those credentials deliberately narrow and verifiable.",
      },
    ],
  },
};

// ------------------------------------------------------------
// Article rendering
// ------------------------------------------------------------

function ArticleBlock({ block }: { block: Block }) {
  switch (block.type) {
    case "p":
      return (
        <p className="text-base leading-8 text-neutral-300">
          {block.text}
        </p>
      );

    case "heading":
      return (
        <h2 className="!mb-5 !mt-16 text-2xl font-semibold leading-tight tracking-tight text-white sm:text-[28px]">
          {block.text}
        </h2>
      );

    case "subheading":
      return (
        <h3 className="!mb-3 !mt-10 text-xl font-semibold tracking-tight text-neutral-100">
          {block.text}
        </h3>
      );

    case "note":
      return (
        <aside className="!my-9 border-l-2 border-neutral-500 bg-neutral-900/50 px-6 py-5 text-base leading-8 text-neutral-200">
          {block.text}
        </aside>
      );

    case "code":
      return (
        <div className="!my-8 overflow-hidden rounded-lg border border-neutral-800 bg-[#111111]">
          <div className="border-b border-neutral-800 px-5 py-3 text-xs uppercase tracking-wider text-neutral-500">
            {block.language}
          </div>

          <pre className="overflow-x-auto p-5 text-[13px] leading-7 text-neutral-300">
            <code>{block.text}</code>
          </pre>
        </div>
      );
  }
}

function readingTime(blocks: Block[]) {
  const words = blocks.reduce((total, block) => {
    return total + block.text.trim().split(/\s+/).length;
  }, 0);

  return `${Math.max(1, Math.ceil(words / 200))} min read`;
}

// ------------------------------------------------------------
// Static routes
// ------------------------------------------------------------

export function generateStaticParams() {
  return writeups.map((article) => ({
    slug: article.slug,
  }));
}

// ------------------------------------------------------------
// Article page
// ------------------------------------------------------------

export default async function WriteupPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const article = writeups.find(
    (item) => item.slug === slug
  );

  const content = articles[slug];

  if (!article || !content) {
    notFound();
  }

  const otherArticles = writeups.filter(
    (item) => item.slug !== slug
  );

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-6 sm:px-10">

      {/* Navigation */}
      <header className="flex flex-wrap items-center justify-between gap-5 border-b border-neutral-800 py-8">
        <Link
          href="/"
          className="text-base font-semibold tracking-tight text-white"
        >
          Mohamed Abdullahi
        </Link>

        <Link
          href="/writeups"
          className="inline-flex items-center gap-2 text-sm text-neutral-400 transition-colors hover:text-white"
        >
          <ArrowLeft size={16} />
          All write-ups
        </Link>
      </header>

      {/* Article */}
      <article className="pb-24 pt-20">

        {/* Metadata */}
        <div className="mb-7 flex flex-wrap items-center gap-4 text-xs text-neutral-500">
          <span>{article.category}</span>

          <span>·</span>

          <time>{article.date}</time>

          <span>·</span>

          <span className="inline-flex items-center gap-1.5">
            <Clock3 size={13} />
            {readingTime(content.blocks)}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-semibold leading-[1.15] tracking-tight text-white sm:text-5xl">
          {article.title}
        </h1>

        {/* Description */}
        <p className="mt-8 text-lg leading-8 text-neutral-400">
          {article.description}
        </p>

        {/* Divider */}
        <div className="mt-14 border-t border-neutral-800" />

        {/* Full article */}
        <div className="space-y-6 pt-12">
          {content.blocks.map((block, index) => (
            <ArticleBlock
              key={`${slug}-${index}`}
              block={block}
            />
          ))}
        </div>

        {/* Repository link */}
        {content.repo && (
          <a
            href={content.repo}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-12 inline-flex items-center gap-2 border-b border-neutral-500 pb-1 text-sm font-medium text-white transition-colors hover:border-white"
          >
            Explore the project repository
            <ArrowUpRight size={16} />
          </a>
        )}
      </article>

      {/* More articles */}
      <section className="border-t border-neutral-800 py-16">
        <h2 className="mb-8 text-xl font-semibold tracking-tight text-white">
          More write-ups
        </h2>

        <div className="divide-y divide-neutral-800 border-t border-neutral-800">
          {otherArticles.map((item) => (
            <Link
              key={item.slug}
              href={`/writeups/${item.slug}`}
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

      {/* Back link */}
      <div className="border-t border-neutral-800 py-10">
        <Link
          href="/writeups"
          className="group inline-flex items-center gap-2 text-sm text-neutral-400 transition-colors hover:text-white"
        >
          <ArrowLeft
            size={16}
            className="transition-transform duration-300 group-hover:-translate-x-1"
          />
          Back to all write-ups
        </Link>
      </div>

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