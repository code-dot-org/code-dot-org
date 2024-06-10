# Development with Docker

## Features

* Run the development server with or without AWS credentials.
* Run local UI acceptance tests in either Chrome, Firefox, or Edge browsers locally.
* Record videos of UI acceptance tests in Chrome, Firefox, or Edge browsers locally.

## Initial setup

Build the web and test containers takes 15 minutes or so.

```shell
docker compose build web test selenium-video
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

```shell
docker compose up selenium-chrome
```

## Troubleshooting

<details> 
  <summary>`Run `bundle install` to install missing gems.`</summary>
  - **Why**: This will happen when you are performing a variety of things when the `Gemfile` changed underneath you.
  - **Solution**: Run `docker compose run --rm install-gems` to install new gems.
</details>
