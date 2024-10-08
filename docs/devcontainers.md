# Code.org on Dev Containers

[Development Containers](https://containers.dev/) (devcontainers) are standardized development environments specifically geared to running Code.org. Devcontainers remove the need to do operating system specific setup, maintenance, and troubleshooting by utilizing the same standard environment for all contributors.

## Getting Started

### Clone Code.org

1. Follow the [instructions](https://docs.github.com/en/repositories/creating-and-managing-repositories/cloning-a-repository) to clone the `code-dot-org/code-dot-org` repository

### Install Docker on MacOS/Windows

1. Follow the instructions to install [Docker Desktop](https://docs.docker.com/get-started/introduction/get-docker-desktop/) for your system
2. [Configure Docker Desktop](https://docs.docker.com/desktop/settings/) to allow either 12 GB memory usage (see sample setups below):
    1. Fastest: Allow Docker Desktop to use 12 GB of RAM and 1 GB of swap
    2. Slower: Allow Docker Desktop to use 8 GB of RAM and 4 GB of swap
  
### Install Docker on Linux

1. Follow the instructions to install [Docker Engine](https://docs.docker.com/engine/install/) for Linux. (Do not install Docker Desktop due to [permission issues](https://github.com/moby/moby/issues/2259))
2. Follow [post installation instructions](https://docs.docker.com/engine/install/linux-postinstall/) for Docker

### Visual Studio Code

1. Install the [Dev Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) extension.
2. Using the [Command Palette](https://code.visualstudio.com/docs/getstarted/userinterface#_command-palette), search for `Dev Containers: Open Folder in Container`.
3. Select the cloned `code-dot-org` repository.
4. The devcontainer should start building and automatically launch
5. Once complete, the environment is fully prepared and ready for development.

## Bootstrapping

The devcontainer includes some beta scripts to help bootstrap the environment with data.

### Option 1: Full Manual Seed

Open a terminal and run 
```bash
.devcontainers/setup.sh
```

This process will take approximately 60-90 minutes depending on your hardware.

### Option 2: Bootstrap Seed

Open a terminal and run 
```bash
.devcontainers/restore.sh
```

This process will take approximately 10-15 minutes depending on your hardware. This requires downloading a bootstrap file.
