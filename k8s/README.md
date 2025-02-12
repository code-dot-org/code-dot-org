# Build & Run code-dot-org under Kubernetes using skaffold

We use [skaffold](https://skaffold.dev/) to make local dev on kubernetes a lot easier. Skaffold
allows us to use a single almost-identical toolchain to both do "docker-compose" style local
dev (a little slower because our massive source tree is baked into the docker image), as well
as deploy real production/test/etc instances to a k8s cluster.

This makes debugging your production infra setup really easy: its just like what you're running
locally.

## Running dashboard using skaffold

### Setup Docker Desktop

We're currently configured to use docker-desktop to run kubernetes, but you could use something else.

1. Start Docker Desktop
1. Start Kubernetes in Docker Desktop settings
1. On mac, enable containerd: https://docs.docker.com/desktop/containerd/#enable-the-containerd-image-store
1. You'll need to give Docker Desktop 100GB (haven't measured?) of disk space in Settings->Resources, than "Apply & Restart"

Optional: you can run `skaffold build` to build the docker images, this will also happen automatically when you run other skaffold commands if needed.

### Seed

Before you run dashboard, you'll need to seed.

1. `skaffold dev -p seed`: this will build the docker images (slow!) and then run `rake install` (slow!)

### Run dashboard

1. `skaffold dev`: this will rebuild anything that needs rebuilding, and start `bin/dashboard`
2. You should be able to open dashboard: http://localhost-studio.code.org:3000
3. When you ctrl-c skaffold dev, dashboard will stop and all k8s resources will be garbage collected (except mysql storage volumes)

### Other Commands

- `k8s/bin/shell` will shell you into the current dashboard kubernetes container, if you are running one (i.e. `skaffold dev`)
- `k8s/bin/bundle_exec.sh` lets you run one-liners under a bundle exec, e.g. `k8s/bin/bundle_exec.sh rake build`
- `skaffold run -p development` or `skaffold run -p production`: deploy dashboard to the k8s cluster, unlike `skaffold dev` these will be deployed permanently, and you'll have to watch the cluster for log output, etc.
- You can stack skaffold profiles, so e.g. you could do `skaffold run -p production,seed` to do a seed against the production configuration.

## Architecture Notes

We use helm as our kubernetes packaging approach, helm charts can be found in `k8s/code-dot-org/helm`.

Skaffold is configured by `skaffold.yaml` in the root folder.

This setup builds "full docker images", including all the source code inside the image. This setup
is good because it means production === development: you're running exactly the same image, and
the image is all you need to spin up an instance. The downside is that it can get a little slow
because we have such a giant repo. As a result, this docker container currently removes a huge
amount of stuff, including pegasus, i18n locales, etc.

Dockerfiles are found in `k8s/*.dockerfile`, note the .dockerignore files that are used to shape
what's included in each image. The key issue is not to be sending 20GBs to the docker daemon when
you build, that takes foooooorever and then each `skaffold dev` suddenly takes 2minutes.
