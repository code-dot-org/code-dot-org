# Build & Run code-dot-org under Kubernetes using skaffold

We use [skaffold](https://skaffold.dev/) to make local dev on kubernetes a lot easier. Skaffold
allows us to use a single almost-identical toolchain to both do "docker-compose" style local
dev (a little slower because our massive source tree is baked into the docker image), as well
as deploy real production/test/etc instances to a k8s cluster.

This makes debugging your production infra setup really easy: its just like what you're running
locally.

## Running dashboard using skaffold

### First time setup

We recommend starting with Docker Desktop to run Kubernetes. If at some point you'd like to switch
to a fully open source toolchain, try (minikube)[https://minikube.sigs.k8s.io/].

#### Docker Desktop

1. [Install Docker Desktop](https://docs.docker.com/get-started/get-docker/)
   1. Alternatively: `brew install --cask docker`
1. Docker Desktop Settings:
   1. [Turn on Kubernetes](https://docs.docker.com/desktop/features/kubernetes/#install-and-turn-on-kubernetes)
   1. If you installed docker before 2025: [enable the containerd image store](https://docs.docker.com/desktop/containerd/#enable-the-containerd-image-store)
   1. Set Resources->Disk Space to at least 100GB (!!!)
1. (Optional) Download [Headlamp](https://headlamp.dev/) to watch as k8s resources are created, view logs, etc.

#### Seed DB and S3

From code-dot-org/ run:
```
skaffold dev --trigger=manual -p setup-db -p setup-s3
```

NOTE: this command **will not exit automatically** when complete, and will take 30+ minutes. 
When you see the output: `[setup-db] setup-db COMPLETE`, press Ctrl-C to exit,
and move on to the [next step](#run-dashboard). 

Alternatively, you can try dashboard before you ctrl-c: http://localhost-studio.code.org:13000

<details>
  <summary>What is it doing?</summary>
Your first skaffold run will:
  1. Build the docker images (20 minutes on an M2)
  1. Then it will run K8S jobs:
     1. setup-db: runs `rake dasboard:setup_db` to seed your DB (25 minutes on an M2)
     1. setup-s3: create s3 buckets in minio (16 seconds on an M2)
</details>

### Run dashboard

Once setup is done, the command to start dashboard is:
```
skaffold dev
```

Then open: http://localhost-studio.code.org:13000

<details>
  <summary>Why does it take 3+ minutes to start `skaffold dev`?</summary>

  Our giant repo size takes that long for docker+skaffold to checksum to make sure no files changed.
  If this is affecting development of docker+k8s features, check out the mimic feature below.
</details>

## Debugging and monitoring dashboard

We create a number of kubernetes resources in a stock dashboard dev setup, including mysql and redis
deployments, a dashboard deployment (that can scale up if you set it to), configurationmaps, storage
volumes, etc.

To understand what's going on, the easiest way is to explore: poke around to view logs, watch statuses
change, etc. While this can all be done using `kubectl`, the stock k8s tool which peeks and pokes yaml,
it can be really really useful to use an interactive k8s browser.

Recommendations:
1. [Headlamp](https://headlamp.dev/) is a cross-platform open source k8s browser application in relatively early dev days. I recommend starting here for k8s exploration purposes.
1. The [VSCode Kubernetes Extension](https://marketplace.visualstudio.com/items?itemName=ms-kubernetes-tools.vscode-kubernetes-tools) is top-notch.
1. [k9s](https://k9scli.io/) is great if you want a keyboard navigable curses-style CLI.

## Useful dev commands

### Skaffold commands

Skaffold is configured by [skaffold.yaml](../skaffold.yaml) ([api docs](https://skaffold.dev/docs/references/yaml/)).
A particularly useful page is [skaffold's CLI docs](https://skaffold.dev/docs/references/cli/).

Here's a quick overview of the 4 most useful commands, run from the repo root:
- `skaffold build` to build the docker images, this will also happen automatically when you run other skaffold commands, if needed.
- `skaffold dev` run dashboard in "dev mode", this will tail log output to the console, and when you ctrl-c to quit, the app will be uninstalled from the cluster automatically.
- `skaffold run` deploy dashboard to the k8s cluster as a standalone app.
- `skaffold dev -p ________`: -p activates a skaffold profile, which can modify skaffold behavior (like running a job, or switching to a more production-like configuration), see [profiles: in skaffold.yaml](../skaffold.yaml) for some of the profiles.

### Other Commands

From the repo root:
- `./k8s/bin/shell` will shell you into the current dashboard kubernetes container, if you are running one (i.e. `skaffold dev`)
- `./k8s/bin/bundle_exec` lets you run one-liners under a bundle exec, e.g. `k8s/bin/bundle_exec irb`
- `./k8s/bin/rake` lets you run rake commands, e.g. `k8s/bin/rake build`
- `./skaffold run -p development` or `skaffold run -p production`: deploy dashboard to the k8s cluster, unlike `skaffold dev` these will be deployed permanently, and you'll have to watch the cluster for log output, etc.
- You can stack skaffold profiles, so e.g. you could do `skaffold run -p production,seed` to do a seed against the production configuration.

## Architecture Notes

We use helm as our kubernetes packaging approach, helm charts can be found in `k8s/helm`.

Skaffold is configured by `skaffold.yaml` in the root folder.

This setup builds "full docker images", including all the source code inside the image. This setup
is good because it means production === development: you're running exactly the same image, and
the image is all you need to spin up an instance. The downside is that it can get a little slow
because we have such a giant repo. As a result, this docker container currently removes a huge
amount of stuff, including pegasus, i18n locales, etc.

Dockerfiles are found in `k8s/docker/*.dockerfile`, note the .dockerignore files that are used to shape
what's included in each image. The key issue is not to be sending 20GBs to the docker daemon when
you build, that takes foooooorever and then each `skaffold dev` suddenly takes 2minutes.

## Mimic: fast iteration for k8s development

To work on our k8s system, including dockerfiles, skaffold and helm charts, it can be a challenge because
of our 10GB+ docker image size. Mimic allows you to deploy our full chart and test dockerfiles without
including the actual contents of our app. Everything is stubbed.

For details, see: [k8s/mimic/README.md](./mimic/README.md)
