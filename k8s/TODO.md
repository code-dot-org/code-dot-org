# TODO

## Performance improvements

### Reduce repo size

With our regular "giant repo with lots of files" it takes `skaffold dev` about **3 minutes to start**
(on an M2) even if there aren't any modified files: this is time docker+skaffold are just spending
checksumming everything to verify they didn't change. This makes k8s development miserable.

A build option to not include pegasus files from the build would help substantially.

Additionally, this one is particularly important because docker builds chew through hundreds of GB
of disk space quite quickly when the base image is so large.

### Get multiplatform layer-cached GH actions building

And make it so when you run `skaffold dev` for the first time, by default its pulling either the most
recent docker layer cache from your branch, or failing that from staging. Make this work on both
x86_64 and arm64.

This would save 20 minutes (on an M2) for first time usage.

## Snapshot seeded DB in GH actions, download in dev

Have GH action snapshot the seeded DB, and re-use that seed in dev. Ideally, have GH actions compute
a hash of all files that could have changed the seed, and only re-seed when that is broken. I believe
we have existing (broken?) code that does this, and it could be repurposed.

## Prod-like improvements

### Prometheus

Figure out how to most cleanly inject prometheus into clusters, including dev clusters. Maybe
include prometheus as a helm chart dependency??

### ArgoCD

Get an ArgoCD setup for prod-like environments.

### CloudFormation

CloudFormation scripts to create a new prod-like EKS cluster.
