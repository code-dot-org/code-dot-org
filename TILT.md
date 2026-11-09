# Tilt

This repo’s local Kubernetes dev path now lives in [Tiltfile](/Users/seth/src/code-dot-org/Tiltfile).

On this machine, `tilt` may resolve to the Ruby templating CLI from `rbenv`. Use `tilt-k8s`
for the real Kubernetes Tilt binary, or put the real `tilt` first on `PATH`.

## Quick Start

Recommended local contexts:
- `docker-desktop`
- `minikube`

Sanity check:

```sh
tilt-k8s version
tilt-k8s doctor
```

Start the default development stack:

```sh
tilt-k8s up
```

Dashboard ports:
- `http://localhost-studio.code.org:13000`
- HMR: `localhost:19000`
- MySQL: `localhost:13306`
- Redis: `localhost:16379`
- MinIO API: `localhost:29000`
- MinIO console: `localhost:29001`

Stop Tilt-managed resources:

```sh
tilt-k8s down
```

## Common Commands

Development:

```sh
tilt-k8s up
```

Mimic:

```sh
tilt-k8s up -- --mode=mimic --env=development
```

Test values:

```sh
tilt-k8s up -- --env=test
```

Production values:

```sh
tilt-k8s up -- --env=production
```

Mount local AWS and gcloud credentials into the dashboard pod:

```sh
tilt-k8s up -- --local-creds=true
```

Allow a non-local cluster context:

```sh
CDO_TILT_REGISTRY=your-registry.example.com/project tilt-k8s up -- --allow-remote=true
```

If the current kube context is not `docker-desktop` or `minikube`, Tilt fails fast unless
`--allow-remote=true` is set. Non-local contexts also require `CDO_TILT_REGISTRY`.

## Setup Jobs

Bring Tilt up first, then trigger the one-shot jobs from another shell:

```sh
tilt-k8s trigger setup-s3
tilt-k8s trigger setup-db
```

These resources are only defined for `--env=development`.

What they do:
- `setup-s3`: creates the standard local MinIO buckets
- `setup-db`: runs `rake dashboard:setup_db`

## Mimic

Mimic uses the same chart and Dockerfile graph with a much smaller stubbed context under
`k8s/mimic/code-dot-org`.

Run it with:

```sh
tilt-k8s up -- --mode=mimic --env=development
```

Tilt automatically runs:

```sh
k8s/mimic/bin/update-cdo-no-symlinks.sh
```

through the `mimic-context` resource.

If mimic breaks after a Dockerfile `COPY` change, update the mimic tree and rerun the sync script.
Every file referenced by `k8s/docker/*.dockerfile` must also exist under `k8s/mimic/code-dot-org`
as either a symlink or a stub.

## Notes

- Helm remains the source of truth for Kubernetes objects under `k8s/helm`.
- The dev image still runs as root for parity with the existing local workflow.
- Live update is only configured for the main dashboard image in full mode.
