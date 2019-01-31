# Overview
**Warning, this project is still in the early stages**

This directory contains Docker Compose files for running the code.org website locally for development and CI purposes.

# Prerequisites

Caveats:

* Only practical on Linux right now - technically works on Mac, but the site runs too slowly to be usable due to poor file system performance for bind-mounted volumes in Docker for Mac.
* Google OAuth for AWS credentials doesn't work, you'll need to provide AWS credentials a different way - EC2 users get this for free

Install:

* Docker
* Docker Compose

# Local Development Usage

Run all docker-compose commands from this directory.

## One-time setup

1. Add these lines to your .bashrc or .bash_profile to set the FIXUID and FIXGID env variables automatically. Then `source` your .bashrc/.bash_profile.
    ```
    export FIXUID=$(id -u)
    export FIXGID=$(id -g)
    ```
2. This recreates most of the SETUP.md instructions, and will probably take a long time:

    ```
    docker-compose -f setup-compose.yml up
    ```

3. Setup your locals.yml file as normal, minus the fields for Google OAuth.

## Usage

Run the server:

```
docker-compose -f site-compose.yml up
```

File changes on your host machine will be picked up by the server like normal.

Stop the server:

```
docker-compose -f site-compose.yml down
```

Start bash in a new container (for now, this is how you do anything else):

```
docker-compose -f site-compose.yml run site bash
```

The Docker Compose files use a bind-mount to make the entire code-dot-org source directory readable and writeable from within the container. They also use volume mounts to persist stateful data across multiple container runs, such as the mysql tables, node_modules, rbenv gems, etc. If needed, you can manage containers and volumes using the docker CLI.
