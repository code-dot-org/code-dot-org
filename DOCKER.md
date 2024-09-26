# Development with Docker

## Features

* Run development server requirements such as MySQL and Redis in containers.

## Installing Docker

Our Docker development environment requires at least Docker Compose version 2.23 or higher.
These instructions will walk you through installing a compatible version.

To install Docker, see the appropriate section below:
[macOS](#macos), [Ubuntu](#ubuntu), [Windows](#windows)
or consult your package management for your OS.

### macOS

1. Install Docker itself:
    1. ```shell
       brew install docker
       ```
    1. You can inspect that docker commands will use this Homebrew-managed version by checking that `which docker` returns either:
        1. `/opt/homebrew/bin/docker` (on M1 or later processors)
        1. `/usr/local/bin/docker` (on Intel processors)

1. Install Docker Compose:
    1. ```shell
       export DOCKER_CONFIG=${DOCKER_CONFIG:-$HOME/.docker}
       mkdir -p $DOCKER_CONFIG/cli-plugins
       architecture=$(uname -m); [ "$architecture" = "arm64" ] && architecture="aarch64"
       curl -SL https://github.com/docker/compose/releases/download/v2.27.0/docker-compose-darwin-$architecture -o $DOCKER_CONFIG/cli-plugins/docker-compose
       chmod +x $DOCKER_CONFIG/cli-plugins/docker-compose
       ```
    1. You can inspect that the version is appropriate by running `docker compose version` and inspecting the result.

1. Install Colima as a container runtime, and, optionally, increase its allocated memory to 8 GB:
    1. ```shell
       brew install colima
       ```
    1. Open `~/.colima/default/colima.yaml` and update the memory allocation to 8 GB:
       ```
       # Size of the memory in GiB to be allocated to the virtual machine.
       # Default: 2
       memory: 8
       ```

1. Start the Colima service (and have it start on login)
```shell
brew services start colima
```

1. Verify that Docker works
```shell
docker run --rm hello-world
```

### Ubuntu

1. Open a terminal.

1. Install Docker via `apt`:

```shell
sudo apt update && sudo apt install docker.io
```

1. Enable and start the Docker service
```shell
sudo systemctl enable docker
sudo systemctl start docker
```

1. Give your account privileges to run Docker
```shell
sudo usermod -aG docker ${USER}
```

1. Verify that Docker works without root (You may need to restart your terminal session.)
```shell
docker run hello-world
```

1. Install Docker Compose:
    1. ```shell
       export DOCKER_CONFIG=${DOCKER_CONFIG:-$HOME/.docker}
       mkdir -p $DOCKER_CONFIG/cli-plugins
       curl -SL https://github.com/docker/compose/releases/download/v2.27.0/docker-compose-linux-$(uname -m) -o $DOCKER_CONFIG/cli-plugins/docker-compose
       chmod +x $DOCKER_CONFIG/cli-plugins/docker-compose
       ```
    1. You can inspect that the version is appropriate by running `docker compose version` and inspecting the result.

### Windows

Docker on Windows is facilitated with the Docker Desktop application which you can find [here](https://www.docker.com/products/docker-desktop/).

When you install that, you will need to follow the instructions in that app to enable Docker, which may require updating some system settings. There are other instructions found [here](https://docs.docker.com/desktop/install/windows-install/) that may help.

1. Install Docker Desktop from [here](https://www.docker.com/products/docker-desktop/). Using instructions found [here](https://docs.docker.com/desktop/install/windows-install/).

1. Start Docker Desktop. It will say "Engine running" in the lower-left corner of the Docker Desktop window.

1. Start your WSL Ubuntu session.

1. Verify Docker works:
```shell
docker run hello-world
```

1. Verify Docker Compose version is at least 2.23.
```shell
docker compose version
```

## Running a Native Dashboard Server

If you want to run the server code natively, but leverage Docker to run the dependent services, you can follow these instructions.

First, you want to follow the normal [SETUP.md](SETUP.md) instructions for your platform.
You can skip over many steps that are related to running mysql and redis.

Instead, once you have a working Ruby and Node environment, you can then use this command to spin up the database and redis servers:

```shell
docker compose run dashboard-services
```

This will tell you which items you will need to place in your `locals.yml` file for the server to connect to the contained database.

Just copy those lines into your `locals.yml` and start your Dashboard server via:

```shell
./bin/dashboard-server
```
