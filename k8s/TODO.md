# TODO

## Performance improvements

### Use jemalloc

Use `jemalloc` in k8s workloads where it helps reduce allocator fragmentation / RSS growth.

### Reduce repo size

With our regular "giant repo with lots of files" it takes `skaffold dev` about **3 minutes to start**
(on an M2) even if there aren't any modified files: this is time docker+skaffold are just spending
checksumming everything to verify they didn't change. This makes k8s development miserable.

A build option to not include pegasus files from the build would help substantially.

Additionally, this one is particularly important because docker builds chew through hundreds of GB
of disk space quite quickly when the base image is so large.

## Snapshot seeded DB in GH actions, download in dev

Have GH action snapshot the seeded DB, and re-use that seed in dev. Ideally, have GH actions compute
a hash of all files that could have changed the seed, and only re-seed when that is broken. I believe
we have existing (broken?) code that does this, and it could be repurposed.

## Prod-like improvements

### Prometheus

Figure out how to most cleanly inject prometheus into clusters, including dev clusters. Maybe
include prometheus as a helm chart dependency??

## Kargo

- Create one `github_organization_webhook` in tofu (for both push and package), publish as an AWS secret, synced down to Kargo, and use in new ProjectConfig, then a warehouse with both subscriptions will be nearly instant (+ clone time lol :-P)
- set `org.opencontainers.image.source=https://github.com/code-dot-org/code-dot-org` and `org.opencontainers.image.revision=<git sha>` OCI tags in `k8s.yml` GH action so Kargo links Freight to source code in the UX, see: <https://docs.kargo.io/user-guide/how-to-guides/working-with-freight#oci-image-annotations>

## Tofu EKS Cluster

See `k8s/tofu/eks-addons/TODO.argocd.diskfill.bug.md` for the Argo CD
repo-server disk-fill investigation notes.

In `k8s/tofu/codeai-k8s/eks-cluster-addons/`, Dex and ArgoCD are still exposed through ALB
`Ingress` resources. Migrate them to Gateway API so the public entry path is consistent with
the Gateway-based direction.

### Manage ArgoCD with ArgoCD

Move ArgoCD management out of Tofu and into ArgoCD itself. When doing this, follow ArgoCD's
`ServerSideApply=true` requirement for self-management:
<https://argo-cd.readthedocs.io/en/latest/operator-manual/declarative-setup/#server-side-apply-requirement>

### Dex

In `k8s/tofu/codeai-k8s-dex/tofu.tfvars`, update `google_email_with_groups_readonly_scope`
to a non-personal email.
