# Overview

**Warning, this project is still in the early stages**

This directory contains Docker Compose files for running the code.org website locally for development and CI purposes.

# Prerequisites

Caveats:

- Only practical on Linux right now - technically works on Mac, but the site runs too slowly to be usable due to poor file system performance for bind-mounted volumes in Docker for Mac.
- Google OAuth for AWS credentials works slightly differently, since code inside the container can't open access your browser directly. Instead, when you need to authenticate, the console will output a link, which you copy and open in your browser, and then paste the auth token you get back into the console. (EC2 users can ignore this.)

Install:

- Docker
- Docker Compose

# Local Development Usage

Run all docker-compose commands from this directory.

## One-time setup

1. Add these lines to your .bashrc or .bash_profile to set the FIXUID and FIXGID env variables automatically. Then `source` your .bashrc/.bash_profile.
   ```
   export FIXUID=$(id -u)
   export FIXGID=$(id -g)
   ```
2. Run the following command. This recreates most of the SETUP.md instructions, and will probably take a long time:

   ```
   docker-compose -f setup-compose.yml up
   ```

3. Setup the rest of your locals.yml file as normal.

## Usage

Run the code.org website locally:

```
docker-compose -f site-compose.yml up
```

File changes on your host machine will be picked up by the server like normal.

Stop the server:

```
docker-compose -f site-compose.yml down
```

Start bash in a new container (for now, this is how you do anything else, e.g. run bin/ scripts or tests):

```
docker-compose -f site-compose.yml run site bash
```

Clean up stopped containers:

```
docker-compose -f site-compose.yml down
```

The Docker Compose files use a bind-mount to make the entire code-dot-org source directory readable and writeable from within the container. They also use volume mounts to persist stateful data across multiple container runs, such as the mysql tables, rbenv gems, etc. If needed, you can manage containers and volumes using the docker CLI.

## Updating the Docker Hub image

Make sure everything works locally using the instructions above.

```
cd docker/continuous-integration
```

Sign in to Docker Hub through the command line; when prompted, enter the password found under "access token for docker cli authentication" in the lastpass docker hub notes field

```
docker login -u codedotorg
```

Build a full image to your local machine

```
docker build .
```

**Note:** We are moving to a new naming convention in order to use different docker images for different purposes. What was the `code-dot-org` image will become the `cdo-ci` image. For now, these docs advise publishing both names.

Tag the new image with an incremented version number. You can get the image id from the end of the build log or from `docker image list`.

```
docker tag <image_id> codedotorg/code-dot-org:<version>
docker tag <image_id> codedotorg/cdo-ci:<version>
```

Upload the image to docker hub (supply the version used in the previous step)

```
docker push codedotorg/code-dot-org:<version>
docker push codedotorg/cdo-ci:<version>
```
