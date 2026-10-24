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
      {"type": "p", "text": "For this project, I built a deployment pipeline for a URL shortener running on Amazon ECS Fargate. Terraform manages the AWS infrastructure, while GitHub Actions builds and deploys the container images."},
      {"type": "p", "text": "I used blue/green deployments with a 10% canary traffic shift and a five-minute monitoring window. I also configured CloudWatch alarms to trigger a rollback if the new deployment became unhealthy."},
      {"type": "p", "text": "Once everything was working, I tested the rollback by deliberately breaking the application’s `/healthz` endpoint."},
      {"type": "p", "text": "The ALB detected the unhealthy targets, the CloudWatch alarm entered the `ALARM` state, and ECS rolled back to the previous healthy revision."},
      {"type": "p", "text": "Here’s how I set it up and some of the issues I ran into along the way."},
      {"type": "heading", "text": "The architecture"},
      {"type": "p", "text": "The application is a URL shortener deployed on ECS Fargate. An Application Load Balancer handles incoming traffic, and Amazon ECR stores the container images."},
      {"type": "p", "text": "I used Terraform to provision the infrastructure and GitHub Actions to automate the deployment process. The workflow authenticates with AWS through OIDC, so there are no long-lived AWS access keys stored in GitHub."},
      {"type": "p", "text": "The main components are:"},
      {"type": "code", "language": "Architecture overview", "text": "GitHub Repository\n       |\n       v\nGitHub Actions ---- OIDC ---- AWS IAM / STS\n       |\n       v\nBuild and scan container images\n       |\n       v\nAmazon ECR\n       |\n       v\nECS Fargate\n       |\n       v\nApplication Load Balancer\n       |\n       +-- Existing application version\n       |\n       +-- Replacement application version"},
      {"type": "p", "text": "I kept the infrastructure in Terraform so I could recreate the environment when needed. This was especially useful for managing AWS costs, since I wasn’t leaving the platform running continuously."},
      {"type": "heading", "text": "Infrastructure and CI/CD"},
      {"type": "p", "text": "Terraform handles the AWS resources, including the networking, IAM configuration and ECS infrastructure."},
      {"type": "p", "text": "Before applying changes, I used the usual validation commands:"},
      {"type": "code", "language": "Bash", "text": "terraform fmt -check\nterraform validate\nterraform plan"},
      {"type": "p", "text": "GitHub Actions handles the container build and deployment workflow. The images are pushed to ECR before being deployed to ECS."},
      {"type": "p", "text": "I also included container security scanning with Trivy, which picked up some issues I’ll cover later."},
      {"type": "subheading", "text": "Authenticating GitHub Actions with AWS"},
      {"type": "p", "text": "I configured GitHub Actions to use OIDC for AWS authentication."},
      {"type": "p", "text": "The workflow requests an OIDC token from GitHub, which AWS STS uses to verify whether the workflow is allowed to assume the configured IAM role."},
      {"type": "p", "text": "The workflow needs the following permissions:"},
      {"type": "code", "language": "GitHub Actions YAML", "text": "permissions:\n  contents: read\n  id-token: write"},
      {"type": "p", "text": "The IAM role’s trust policy then determines which GitHub workflows can assume it."},
      {"type": "p", "text": "Getting that trust policy right turned out to be one of the more time-consuming parts of the project."},
      {"type": "heading", "text": "Debugging the OIDC trust policy"},
      {"type": "p", "text": "At one point, the GitHub Actions workflow started failing with an `sts:AssumeRoleWithWebIdentity` error."},
      {"type": "p", "text": "The role’s trust policy was expecting a subject claim in the usual GitHub format:"},
      {"type": "code", "language": "Expected OIDC subject", "text": "repo:OWNER/REPOSITORY:ref:refs/heads/main"},
      {"type": "p", "text": "I inspected the OIDC token being issued by GitHub and found that the actual subject included the owner and repository IDs:"},
      {"type": "code", "language": "Observed OIDC subject", "text": "repo:OWNER@OWNER_ID/REPOSITORY@REPOSITORY_ID:ref:refs/heads/main"},
      {"type": "p", "text": "The trust policy didn’t match that subject, so AWS was rejecting the role-assumption request."},
      {"type": "p", "text": "I updated the trust conditions to match the actual token claims, and the workflow was able to authenticate successfully."},
      {"type": "p", "text": "I went into the OIDC debugging in more detail in my separate article, **Your GitHub Actions Workflow Has No AWS Keys. Is It Actually Secure?**"},
      {"type": "heading", "text": "Configuring the blue/green deployment"},
      {"type": "p", "text": "For the deployment strategy, I used a canary rollout."},
      {"type": "p", "text": "The new application version initially receives 10% of traffic, while the existing version continues handling the remaining 90%."},
      {"type": "p", "text": "I configured a five-minute monitoring window before the deployment progressed."},
      {"type": "p", "text": "During that period, the ALB health checks and CloudWatch alarms provide the signals used to determine whether the deployment should continue or roll back."},
      {"type": "p", "text": "The configuration was:"},
      {"type": "code", "language": "Deployment configuration", "text": "Deployment strategy: Blue/green\nInitial traffic shift: 10%\nMonitoring window: 5 minutes\nHealth checks: Application Load Balancer\nFailure monitoring: CloudWatch alarms\nRecovery: Automatic rollback"},
      {"type": "p", "text": "I wanted to test the full process, including what happened when the replacement application failed its health checks."},
      {"type": "heading", "text": "Testing the automatic rollback"},
      {"type": "p", "text": "To test the rollback, I deliberately broke the `/healthz` endpoint in the application and deployed the faulty revision."},
      {"type": "p", "text": "The endpoint is used by the health checks to determine whether the application is healthy, so breaking it gave me a controlled way to trigger a deployment failure."},
      {"type": "p", "text": "After starting the deployment, the ALB detected that the replacement targets were unhealthy."},
      {"type": "p", "text": "The associated CloudWatch alarm entered the `ALARM` state, and ECS triggered the rollback."},
      {"type": "code", "language": "Rollback test", "text": "Broken /healthz deployed\n          |\n          v\n10% canary deployment begins\n          |\n          v\nALB health checks fail\n          |\n          v\nCloudWatch alarm enters ALARM\n          |\n          v\nAutomatic rollback triggered\n          |\n          v\nPrevious healthy revision restored"},
      {"type": "p", "text": "I checked the deployment afterwards and confirmed that ECS had restored the previous healthy revision."},
      {"type": "p", "text": "The rollback happened automatically, without me needing to manually deploy the earlier image."},
      {"type": "subheading", "text": "What the test covered"},
      {"type": "p", "text": "This test covered a deployment where the replacement application failed its configured health checks."},
      {"type": "p", "text": "There are other failure scenarios I’d still want to test."},
      {"type": "p", "text": "For example, the `/healthz` endpoint could return a successful response while the URL shortener’s main functionality was broken. In that situation, the ALB might continue reporting healthy targets."},
      {"type": "p", "text": "Adding application-level checks for URL creation and redirects would give the deployment pipeline more useful signals."},
      {"type": "p", "text": "I’d also like to measure how long recovery takes from the initial failure to the previous revision being restored."},
      {"type": "heading", "text": "Container security scanning"},
      {"type": "p", "text": "I used Trivy to scan the container images and encountered vulnerability findings that needed addressing."},
      {"type": "p", "text": "I updated the Go build images, upgraded dependencies including `github.com/lib/pq`, and added package upgrades to the Alpine runtime images."},
      {"type": "p", "text": "The images were building successfully, but the security scans still needed attention. I worked through the findings and updated the Dockerfiles and dependencies."},
      {"type": "heading", "text": "Managing AWS costs"},
      {"type": "p", "text": "I wasn’t keeping the environment running permanently, so being able to recreate it was important."},
      {"type": "p", "text": "The platform uses services such as ECS Fargate and an Application Load Balancer, which can generate costs even when the application isn’t receiving much traffic."},
      {"type": "p", "text": "Keeping the infrastructure in Terraform made it easier to provision the environment for testing and tear it down afterwards."},
      {"type": "p", "text": "It also meant I could return to the project without having to rebuild the AWS configuration manually."},
      {"type": "heading", "text": "What I’d improve next"},
      {"type": "p", "text": "The rollback test worked for the failure I introduced, but there are a few areas I’d like to explore further."},
      {"type": "p", "text": "The first is application-level monitoring. I’d want the deployment to detect problems with creating and resolving shortened URLs, even when the health endpoint is responding normally."},
      {"type": "p", "text": "I’d also like to measure rollback duration and test failures that develop over a longer period."},
      {"type": "p", "text": "Another area is database compatibility. Rolling back an application doesn’t automatically reverse database changes, so future versions would need to account for that."},
      {"type": "heading", "text": "Final thoughts"},
      {"type": "p", "text": "This project gave me practical experience with ECS deployments, Terraform, GitHub Actions, OIDC and CloudWatch monitoring."},
      {"type": "p", "text": "The rollback experiment was particularly useful because I could follow the failure from the application health checks through to the CloudWatch alarm and the ECS deployment."},
      {"type": "p", "text": "There are still other failure scenarios I’d want to investigate, particularly ones that don’t affect the health endpoint."},
    ],
  },

  "github-actions-oidc-security": {
    blocks: [
      {
        type: "p",
        text: "My GitHub Actions workflow was failing to authenticate with AWS.",
      },
      {
        type: "p",
        text: "The IAM role existed, the OIDC provider was configured, and the trust policy appeared to restrict access to the correct repository and branch.",
      },
      {
        type: "p",
        text: "Yet every attempt returned the same error:",
      },
      {
        type: "code",
        language: "Authentication error",
        text: "Error: Could not assume role with OIDC:\nNot authorized to perform sts:AssumeRoleWithWebIdentity",
      },
      {
        type: "p",
        text: "I eventually found the problem by decoding the GitHub OIDC token and inspecting its claims. The subject AWS was expecting wasn’t the subject GitHub was issuing.",
      },
      {
        type: "p",
        text: "That led me to test something else: what would happen if I made the trust policy less restrictive?",
      },
      {
        type: "p",
        text: "I ran the same workflow from the same branch, changing only the IAM trust condition. A branch that AWS had previously rejected was suddenly able to assume the role.",
      },
      {
        type: "p",
        text: "It was a useful reminder that removing long-lived AWS credentials is only part of securing a deployment pipeline. The conditions under which temporary credentials are issued matter just as much.",
      },
      {
        type: "heading",
        text: "What OIDC actually protects against",
      },
      {
        type: "p",
        text: "OIDC is a significant improvement over storing permanent AWS credentials in GitHub Actions secrets.",
      },
      {
        type: "p",
        text: "Instead of retrieving a long-lived access key, a workflow requests a signed identity token from GitHub. AWS evaluates that token against an IAM role’s trust policy and, if the conditions match, issues temporary credentials through AWS Security Token Service (STS).",
      },
      {
        type: "p",
        text: "A typical workflow uses:",
      },
      {
        type: "code",
        language: "yaml",
        text: "permissions:\n  id-token: write\n  contents: read\njobs:\n  deploy:\n    runs-on: ubuntu-latest\n    steps:\n      - name: Configure AWS credentials\n        uses: aws-actions/configure-aws-credentials@v4\n        with:\n          role-to-assume: ${{ secrets.AWS_ROLE_ARN }}\n          aws-region: eu-west-2",
      },
      {
        type: "p",
        text: "The id-token: write permission allows the job to request an OIDC token. It doesn’t grant AWS access by itself.",
      },
      {
        type: "p",
        text: "The AWS role’s trust policy determines whether the token can be exchanged for temporary credentials.",
      },
      {
        type: "p",
        text: "This removes the need to store long-lived AWS keys, but it introduces a question worth examining: which GitHub execution contexts are allowed to assume the role?",
      },
      {
        type: "heading",
        text: "The difference between trusting a branch and trusting a repository",
      },
      {
        type: "p",
        text: "A conventional GitHub OIDC subject for a workflow running on main looks like this:",
      },
      {
        type: "code",
        language: "text",
        text: "repo:OWNER/REPOSITORY:ref:refs/heads/main",
      },
      {
        type: "p",
        text: "AWS can restrict role assumption to that exact subject:",
      },
      {
        type: "code",
        language: "json",
        text: "{\n  \"Condition\": {\n    \"StringEquals\": {\n      \"token.actions.githubusercontent.com:aud\": \"sts.amazonaws.com\",\n      \"token.actions.githubusercontent.com:sub\": \"repo:OWNER/REPOSITORY:ref:refs/heads/main\"\n    }\n  }\n}",
      },
      {
        type: "p",
        text: "Now compare that with a wildcard:",
      },
      {
        type: "code",
        language: "json",
        text: "{\n  \"Condition\": {\n    \"StringEquals\": {\n      \"token.actions.githubusercontent.com:aud\": \"sts.amazonaws.com\"\n    },\n    \"StringLike\": {\n      \"token.actions.githubusercontent.com:sub\": \"repo:OWNER/REPOSITORY:ref:refs/heads/*\"\n    }\n  }\n}",
      },
      {
        type: "p",
        text: "The first policy restricts access to the main branch context.",
      },
      {
        type: "p",
        text: "The second allows matching branch contexts throughout the repository.",
      },
      {
        type: "p",
        text: "That distinction matters when a team has different levels of access.",
      },
      {
        type: "p",
        text: "Imagine developers can push to feature branches, but production deployments must go through a reviewed workflow on main.",
      },
      {
        type: "p",
        text: "If the production IAM role trusts every branch, a developer who can create and execute workflows on another branch could potentially assume that role.",
      },
      {
        type: "p",
        text: "They might have permission to contribute code without having permission to deploy it to production. An overly broad trust policy can erase that distinction.",
      },
      {
        type: "p",
        text: "It also increases the impact of a compromised GitHub account. An attacker who gains access to an account capable of pushing workflows could potentially use the same route to obtain AWS credentials.",
      },
      {
        type: "p",
        text: "This isn’t a weakness in OIDC itself. AWS is enforcing the conditions you’ve configured.",
      },
      {
        type: "p",
        text: "The issue is whether those conditions represent the access boundaries you actually intended.",
      },
      {
        type: "p",
        text: "There’s an important distinction with pull requests, too.",
      },
      {
        type: "p",
        text: "For a conventional pull-request workflow that isn’t using an environment-based or customised subject, GitHub’s OIDC subject generally looks like:",
      },
      {
        type: "code",
        language: "text",
        text: "repo:OWNER/REPOSITORY:pull_request",
      },
      {
        type: "p",
        text: "The refs/heads/* wildcard shown above wouldn’t match that subject.",
      },
      {
        type: "p",
        text: "A broader pattern such as repo:OWNER/REPOSITORY:* could match additional contexts, including pull-request subjects. That broader pattern wasn’t part of my experiment.",
      },
      {
        type: "heading",
        text: "The permissions behind the temporary credentials",
      },
      {
        type: "p",
        text: "Even with a carefully restricted trust policy, there’s another question: what can the role actually do?",
      },
      {
        type: "p",
        text: "An IAM role has two distinct security controls.",
      },
      {
        type: "p",
        text: "Its trust policy determines who can assume it. Its permissions policies determine what the resulting credentials can access.",
      },
      {
        type: "p",
        text: "Suppose a deployment workflow only needs to update an ECS service.",
      },
      {
        type: "p",
        text: "Giving that workflow AdministratorAccess would expose far more of the AWS account than the deployment requires.",
      },
      {
        type: "p",
        text: "If malicious code executes inside an authorised job, it may be able to use the temporary credentials available to that job.",
      },
      {
        type: "p",
        text: "Those credentials expire, but that doesn’t make excessive permissions harmless. A short-lived session can still be used to modify or delete infrastructure.",
      },
      {
        type: "p",
        text: "The better approach is to identify the AWS actions required by the deployment and restrict the role accordingly.",
      },
      {
        type: "p",
        text: "The exact policy will depend on the architecture. An ECS deployment involving ECR, task definitions, IAM role passing and service updates may need several permissions, but each should have a reason for being there.",
      },
      {
        type: "p",
        text: "This is why I wouldn’t assess a pipeline’s security by looking at its authentication method alone.",
      },
      {
        type: "p",
        text: "A restrictive trust policy and narrowly scoped IAM permissions address different risks. Both matter.",
      },
      {
        type: "heading",
        text: "GitHub is part of the trust boundary",
      },
      {
        type: "p",
        text: "There’s another limitation to branch restrictions.",
      },
      {
        type: "p",
        text: "A trust policy that only accepts main doesn’t establish that the code running on main is safe.",
      },
      {
        type: "p",
        text: "If someone can modify a privileged workflow and push those changes directly to the trusted branch, AWS may still accept the resulting OIDC token.",
      },
      {
        type: "p",
        text: "AWS evaluates the identity and claims presented by the workflow. It doesn’t inspect the workflow’s commands to decide whether they should be trusted.",
      },
      {
        type: "p",
        text: "That makes repository controls important.",
      },
      {
        type: "p",
        text: "Protected branches, required reviews and restrictions on workflow changes can help prevent unauthorised code from reaching trusted execution contexts.",
      },
      {
        type: "p",
        text: "The same applies to dependencies.",
      },
      {
        type: "p",
        text: "A third-party GitHub Action running in a privileged job becomes part of the code you’re relying on. Pinning actions to immutable commit SHAs and reviewing dependencies can reduce the risk of unexpected changes.",
      },
      {
        type: "p",
        text: "Workflows that handle untrusted contributions also need careful design. In particular, pull_request_target workflows can become dangerous when they check out and execute untrusted pull-request code while retaining access to privileged resources.",
      },
      {
        type: "p",
        text: "OIDC doesn’t remove these concerns. It changes how credentials are issued, not whether the code using them is trustworthy.",
      },
      {
        type: "heading",
        text: "Testing the trust policy",
      },
      {
        type: "p",
        text: "I wanted to see the branch restriction work in practice.",
      },
      {
        type: "p",
        text: "I created an isolated IAM role called github-oidc-security-test with no attached permissions policies.",
      },
      {
        type: "p",
        text: "That was intentional. The experiment was about role assumption, not accessing AWS resources.",
      },
      {
        type: "p",
        text: "I also created a manually triggered GitHub Actions workflow that attempted to assume the role and then ran:",
      },
      {
        type: "code",
        language: "bash",
        text: "aws sts get-caller-identity",
      },
      {
        type: "subheading",
        text: "First problem: the subject didn’t match",
      },
      {
        type: "p",
        text: "My initial trust policy expected GitHub’s conventional subject format:",
      },
      {
        type: "code",
        language: "text",
        text: "repo:OWNER/REPOSITORY:ref:refs/heads/main",
      },
      {
        type: "p",
        text: "But the workflow couldn’t assume the role.",
      },
      {
        type: "p",
        text: "To investigate, I added a debugging step that requested a GitHub OIDC token and decoded its JWT payload.",
      },
      {
        type: "p",
        text: "I logged selected claims rather than the complete token.",
      },
      {
        type: "p",
        text: "The actual subject contained numeric owner and repository IDs:",
      },
      {
        type: "code",
        language: "text",
        text: "repo:OWNER@OWNER_ID/REPOSITORY@REPOSITORY_ID:ref:refs/heads/main",
      },
      {
        type: "p",
        text: "The audience was sts.amazonaws.com, as expected.",
      },
      {
        type: "p",
        text: "The subject format was different from the one in my trust policy.",
      },
      {
        type: "p",
        text: "I updated the trust policy to match the observed claim, and the workflow authenticated successfully.",
      },
      {
        type: "p",
        text: "The token showed the ID-based subject, but I haven’t independently verified the GitHub subject-template settings responsible for that format.",
      },
      {
        type: "subheading",
        text: "Second test: restricting access to main",
      },
      {
        type: "p",
        text: "Next, I created a branch called:",
      },
      {
        type: "code",
        language: "text",
        text: "test/oidc-unauthorised-branch",
      },
      {
        type: "p",
        text: "I triggered the same workflow from that branch while the IAM trust policy remained restricted to main.",
      },
      {
        type: "p",
        text: "AWS rejected the request:",
      },
      {
        type: "code",
        language: "text",
        text: "Not authorized to perform sts:AssumeRoleWithWebIdentity",
      },
      {
        type: "p",
        text: "That was the expected result.",
      },
      {
        type: "p",
        text: "The OIDC token identified the test branch, which didn’t satisfy the role’s trust condition.",
      },
      {
        type: "subheading",
        text: "Third test: allowing every branch",
      },
      {
        type: "p",
        text: "I changed the isolated role’s trust policy to use StringLike with a wildcard:",
      },
      {
        type: "code",
        language: "json",
        text: "{\n  \"StringLike\": {\n    \"token.actions.githubusercontent.com:sub\": \"repo:OWNER@OWNER_ID/REPOSITORY@REPOSITORY_ID:ref:refs/heads/*\"\n  }\n}",
      },
      {
        type: "p",
        text: "The audience condition remained restricted to sts.amazonaws.com.",
      },
      {
        type: "p",
        text: "I then reran the workflow from the same test branch.",
      },
      {
        type: "p",
        text: "This time, authentication succeeded.",
      },
      {
        type: "p",
        text: "The workflow returned:",
      },
      {
        type: "code",
        language: "json",
        text: "{\n  \"UserId\": \"<ROLE_ID>:GitHubActions\",\n  \"Account\": \"<AWS_ACCOUNT_ID>\",\n  \"Arn\": \"arn:aws:sts::<AWS_ACCOUNT_ID>:assumed-role/github-oidc-security-test/GitHubActions\"\n}",
      },
      {
        type: "p",
        text: "The branch AWS had rejected was now able to assume the role.",
      },
      {
        type: "p",
        text: "I hadn’t changed the workflow or attached any permissions policies to the IAM role. The change was entirely in the trust policy.",
      },
      {
        type: "p",
        text: "It’s important not to overstate the result.",
      },
      {
        type: "p",
        text: "I didn’t demonstrate an unauthorised production deployment or access to protected infrastructure. The test role had no attached permissions policies, and get-caller-identity only confirmed which AWS identity the workflow was using.",
      },
      {
        type: "p",
        text: "What the experiment established was narrower and more useful: changing the subject restriction changed which GitHub branch contexts could obtain credentials for that role.",
      },
      {
        type: "p",
        text: "Afterwards, I restored the exact main restriction and verified the trust policy directly in AWS.",
      },
      {
        type: "heading",
        text: "What I’d check in a production deployment",
      },
      {
        type: "p",
        text: "If I were reviewing an OIDC-enabled deployment pipeline, I’d examine three areas.",
      },
      {
        type: "p",
        text: "First, the IAM trust policy. I’d check the actual subject claims, the audience condition and whether any wildcards allow execution contexts beyond those intended.",
      },
      {
        type: "p",
        text: "Second, the role’s permissions. I’d look at which AWS actions are allowed, which resources they apply to and whether the workflow needs every permission it has.",
      },
      {
        type: "p",
        text: "Third, the GitHub repository. I’d check who can modify privileged workflows, whether deployment branches are protected and what third-party or untrusted code can execute in jobs with AWS access.",
      },
      {
        type: "p",
        text: "For more sensitive deployments, I’d also consider whether trusting a branch is sufficiently precise.",
      },
      {
        type: "p",
        text: "GitHub provides deployment environments and additional OIDC claims, including job_workflow_ref, which identifies the workflow involved in execution.",
      },
      {
        type: "p",
        text: "With a suitable customised OIDC subject configuration, workflow identity can form part of the conditions AWS evaluates. GitHub environment protection rules can also provide an additional deployment approval boundary.",
      },
      {
        type: "p",
        text: "Those controls are worth considering when multiple workflows share a repository but only certain ones should deploy to production.",
      },
      {
        type: "heading",
        text: "Final thoughts",
      },
      {
        type: "p",
        text: "Using OIDC is a sensible improvement over storing long-lived AWS credentials in GitHub Actions.",
      },
      {
        type: "p",
        text: "But I wouldn’t treat the absence of static keys as evidence that the entire pipeline is secure.",
      },
      {
        type: "p",
        text: "The trust policy still determines which GitHub identities can obtain temporary credentials, and the role’s permissions determine what those credentials can do.",
      },
      {
        type: "p",
        text: "In my experiment, changing one trust condition was enough to turn a rejected branch into an authenticated one.",
      },
      {
        type: "p",
        text: "AWS hadn’t made a mistake. It was following the policy I’d given it.",
      },
      {
        type: "p",
        text: "That’s what I’d want to verify in a real deployment: whether the policy grants access to exactly the workflows that are supposed to have it.",
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
        <div className="!my-8 min-w-0 max-w-full overflow-hidden rounded-lg border border-neutral-800 bg-[#111111]">
          <div className="border-b border-neutral-800 px-5 py-3 text-xs uppercase tracking-wider text-neutral-500">
            {block.language}
          </div>

          <pre className="max-w-full overflow-x-auto p-4 text-xs leading-6 text-neutral-300 sm:p-5 sm:text-[13px] sm:leading-7">
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
    <main className="mx-auto min-h-screen w-full min-w-0 max-w-3xl px-4 sm:px-10">

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
        <h1 className="break-words text-3xl font-semibold leading-[1.15] tracking-tight text-white sm:text-5xl">
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