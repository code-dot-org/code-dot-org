# Development with Docker

## Features

* Run the development server with or without AWS credentials.
* Run local UI acceptance tests in either Chrome, Firefox, or Edge browsers locally.
* Record videos of UI acceptance tests in Chrome, Firefox, or Edge browsers locally.

## Installing Docker

Our Docker development environment requires at least Docker Compose version 2.22 or higher.

To install Docker, consult your package management for your OS. For Ubuntu, for instance,
install the `docker.io` package:

```shell
sudo apt update && sudo apt install docker.io
```

Then, install the `docker compose` plugin manually, as instructed by [this page](https://docs.docker.com/compose/install/linux/)
or by running the following commands to install a known working version (which requires `curl` to be installed):

```shell
DOCKER_CONFIG=${DOCKER_CONFIG:-$HOME/.docker}
mkdir -p $DOCKER_CONFIG/cli-plugins
curl -SL https://github.com/docker/compose/releases/download/v2.27.0/docker-compose-linux-x86_64 -o $DOCKER_CONFIG/cli-plugins/docker-compose
chmod +x $DOCKER_CONFIG/cli-plugins/docker-compose
```

You can inspect that the version is appropriate by running `docker compose version` and inspecting the result.

## Initial setup

Build the web and test containers takes 15 minutes or so.

```shell
FIXUID=$(id -u) docker compose build web test selenium-video
```

Now we can install the environment inside the container.

```shell
docker compose run install-rbenv
docker compose run install-nvm
docker compose run install
docker compose run build
```


## Running the Server

After initial setup, we can then run a server instance.

```shell
docker compose up web
```

## Running Tests

To run a basic UI test:

```shell
docker compose run ui-test-firefox dashboard/test/ui/features/platform/signing_in.feature
```

You can run a UI test against a few types of browsers like this: The `ui-test-firefox` runs it against
the Firefox browser.

```shell
docker compose run ui-test-firefox dashboard/test/ui/features/platform/signing_in.feature
```

This will record a video of the given UI test running in Firefox and you will find it in `/tmp/my-video.firefox.mp4`.

```shell
NAME=my-video docker compose run record-ui-test-firefox dashboard/test/ui/features/platform/signing_in.feature
```

## Troubleshooting

<details> 
  <summary>`Run `bundle install` to install missing gems.`</summary>
  - **Why**: This will happen when you are performing a variety of things when the `Gemfile` changed underneath you.
  - **Solution**: Run `docker compose run --rm install-gems` to install new gems.
</details>
