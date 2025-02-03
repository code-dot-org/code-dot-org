# Development with Docker

The basic setup runs dashboard (our service) and its dependent services (e.g. mysql, redis)
inside containers. For an alternative setup, where only dependent services run inside containers,
see the [alternative setup](#alternative-setup-run-dependent-services-in-docker).

## Basic Setup

1. Install docker for: [macOS](#macos), [Ubuntu](#ubuntu), [Windows](#windows)
1. To start dashboard and its dependencies, run in this directory:
   ```shell
   docker-compose up
   ```

## Installing Docker

See platform-specific installation instructions: [macOS](#macos), [Ubuntu](#ubuntu), [Windows](#windows)

Our Docker development environment requires at least [Docker
Compose](https://docs.docker.com/compose/) version 2.23 or higher, as well as a compatible
installation of [Docker Engine](https://docs.docker.com/engine/). If you'd like a GUI
interface and a one-click installation process, consider [Docker
Desktop](https://docs.docker.com/desktop/).

### macOS

Installing Docker Desktop for macOS ([download](https://docs.docker.com/desktop/setup/install/mac-install/)) provides all required dependencies.

### Advanced Option: if you prefer a fully open source toolchain without a GUI

The [colima](https://github.com/abiosoft/colima) project provides a fully open source
docker-compatible engine for macOS.

1. Install dependencies from homebrew:
   ```shell
   brew install docker docker-compose colima
   ```

1. Start the Colima service (and have it start on login):
   ```shell
   brew services start colima
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

1. Install Docker Compose:
   ```shell
   export DOCKER_CONFIG=${DOCKER_CONFIG:-$HOME/.docker}
   mkdir -p $DOCKER_CONFIG/cli-plugins
   curl -SL https://github.com/docker/compose/releases/download/v2.27.0/docker-compose-linux-$(uname -m) -o $DOCKER_CONFIG/cli-plugins/docker-compose
   chmod +x $DOCKER_CONFIG/cli-plugins/docker-compose
   ```

### Windows

Docker on Windows is facilitated with the Docker Desktop application, which you can find
[here](https://www.docker.com/products/docker-desktop/).

When you install that, you will need to follow the instructions in that app to enable
Docker, which may require updating some system settings. There are other instructions
found [here](https://docs.docker.com/desktop/install/windows-install/) that may help.

1. Install Docker Desktop from [here](https://docs.docker.com/desktop/install/windows-install/).

1. Start Docker Desktop. It will say "Engine running" in the lower-left corner of the
   Docker Desktop window.

1. Start your WSL Ubuntu session.

## Verifying Successful Installation

Once Docker with Docker Compose has been installed:

1. Verify Docker works without root (you may need to restart your terminal session):
   ```shell
   docker run --rm hello-world
   ```

1. Verify Docker Compose version is at least 2.23.
   ```shell
   docker compose version
   ```

## Alternative Setup: run dependent services in docker

If you want to run the server code natively, but leverage Docker to run the dependent
services, you can follow these instructions.

First [install docker](#installing-docker). Then follow the normal [SETUP.md](../../SETUP.md) instructions for your platform.  You can skip over many steps that are related to running
MySQL and Redis.

> **Note**
>
> If you are already running MySQL and/or Redis natively, you may depending on your
> operating system need to stop those services or the `docker compose run` command below
> will fail due to in-use ports.
>
> On Linux, that will likely be:
>
> ```shell
> sudo systemctl stop mysql
> sudo systemctl stop redis
> ```
>
> On MacOS, that will likely be:
>
> ```shell
> brew services stop mysql@8.0
> brew services stop redis
> ```

Once you have a working Ruby and Node environment, you can then use this command to spin
up the database and Redis servers:

```shell
docker compose run dashboard-services
```

This will tell you which items you will need to place in your `locals.yml` file for the
server to connect to the contained database.

Just copy those lines into your `locals.yml` and start your Dashboard server as normal via:

```shell
./bin/dashboard-server
```
