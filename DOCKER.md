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
```shell
brew install docker
```

1. Install Docker Compose:
    1. ```shell
       export DOCKER_CONFIG=${DOCKER_CONFIG:-$HOME/.docker}
       mkdir -p $DOCKER_CONFIG/cli-plugins
       curl -SL https://github.com/docker/compose/releases/download/v2.27.0/docker-compose-darwin-$(uname -m) -o $DOCKER_CONFIG/cli-plugins/docker-compose
       chmod +x $DOCKER_CONFIG/cli-plugins/docker-compose
       ```
    1. You can inspect that the version is appropriate by running `docker compose version` and inspecting the result.

1. Install Colima as a container runtime:
```shell
brew install colima
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
docker compose run all-services
```

If you are Code.org staff and want to be using an AWS credential, you do not need to start the S3 emulation. It is, however, still
recommended. However, if you want to run all essential services and not run AWS emulation, use this command instead:

```shell
docker compose run dashboard-services
```

This will tell you which items you will need to place in your `locals.yml` file for the server to connect to the contained database and
emulated S3 environment, if you elect to use that (recommended).

Just copy those lines into your `locals.yml` and start your Dashboard server via:

```shell
./bin/dashboard-server
```

## Running UI tests with a Native Dashboard Server

When running your dashboard server natively, you may want to run browser-based UI tests against certain versions of browsers. We
can support this via Docker and a set of Selenium containers.

Essentially, Selenium is a service that opens a few ports that allow remote control of a browser instance. Selenium offers a
"Grid" service that can manage a variety of device types for you. To start up a prepared set of those browser types, you can
spin up the service as such:

```shell
docker compose run selenium-nodes
```

You will see some messaging about how to witness the running tests if you would like to. For instance, for viewing the Edge
tests as they run, you can open up a browser tab that will connect via VNC to the running container:

[http://localhost:7912/?autoconnect=1&resize=scale&password=secret](http://localhost:7912/?autoconnect=1&resize=scale&password=secret)

You can refer to the message for ways to connect to the other browser sessions.

To run a test with the containerized Selenium Grid (here we are just running one feature to test things out):

```shell
rake test:ui browser=edge selenium= feature=dashboard/test/ui/features/platform/signing_in.feature
```

To stop all Selenium Grid nodes:

```shell
docker compose stop $(docker compose ps --services | grep selenium | awk \'{print $1}\')'
```

## Running a Selenium service for a particular specific browser

Sometimes you might care to not start the whole set of Selenium nodes and, instead, can elect to just spin up a particular
instance.  You can spin up such a service for the particular browser you want.

First, make sure you start your dashboard server:

```shell
./bin/dashboard-server
```

Then, you can tell it to start up a Chrome instance (and you can substitute `chrome` with `firefox` or `edge`):

```shell
docker compose run selenium-chrome
```

When it runs, it will then tell you how to run a UI test and how to connect to the VNC instance. Each browser runs on a
different port, so you will need to refer to that message to know how to interact.

The final line in that message is an example of running a particular UI test file against that running browser. It will
look something like this (for Chrome):

```shell
rake test:ui browser=chrome selenium=http://localhost:4444/wd/hub feature=dashboard/test/ui/features/platform/signing_in.feature
```

When you are done, you can spin down the selenium server (Again, substituting `chrome` with `firefox` or `edge` as needed):

```shell
docker compose stop selenium-chrome-native
```

## Using a different browser version with Selenium

These commands above will start either a Selenium Grid and a set of "nodes" that isolate each browser into its own container, or
the browser instance as a standalone Selenium service. Either way, the browsers will have their versions match our CI instance
(see `dashboard/test/ui/browsers.json`) but you can alter those versions if you would like to target a particular version.

To use a different version, first ensure that you have any running instances shut down:

```shell
docker compose stop $(docker compose ps --services | grep selenium | awk \'{print $1}\')'
```

After this, modify `docker/developers/.env` and update the `SELENIUM_CHROME_VERSION` (or `FIREFOX` or `EDGE` as needed) with
the version you want to target. Then follow the normal instructions again. It will download a new Docker image for that
browser version as you start it back up again.

The version needs to match those found on the Docker Hub. For instance, for Chrome, one can look at
[the hub page for standalone-chrome](https://hub.docker.com/r/selenium/standalone-chrome/tags) to find the right version tag.
Generally, tags in the form of `<major>.<minor>`, such as `105.0`, are available, but there are more specific versions as well.

## Recording a video of a UI test

When using the Selenium services via Docker, you can record a UI test by using the selenium-video service.

To use this, you need to spin up the video recording service:

```shell
docker compose run selenium-video
```

Then, run the ui test with the `record=<filename>` specified. For instance, to record a Chrome test (based on the commands you
will find above):

```shell
rake test:ui browser=chrome record=my-video selenium=http://localhost:4444/wd/hub feature=dashboard/test/ui/features/platform/signing_in.feature
```

You will then find a `my-video.chrome.mp4` file in your temporary directory (usually `/tmp`).

## Managing Local S3 Buckets

When running with AWS emulation, we use a service called MinIO to emulate S3 locally.
When that service is running, you can log on to its dashboard on port `3001` at
[http://localhost:3001](http://localhost:3001).

By default, the username is `local-development` and the password is `allstudents`.

Once you are logged in, you can visit the "Object Browser" like so:

![The Object Browsers button on the left-hand navigation column](docker/developers/minio.png)

On these pages, you can navigate into buckets as though they were normal folders and view
file metadata, delete files, and download content that is locally stored.

### Removing Local S3 Data

If you want to remove all data, you can delete the buckets on the dashboard and re-run the
minio install script via:

```shell
docker compose run minio-install
```

This will recreate any missing buckets corresponding to subdirectories found in
[`docker/developers/s3`](docker/developers/s3).
