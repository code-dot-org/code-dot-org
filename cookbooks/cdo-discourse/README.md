# cdo-discourse Cookbook
Installs and configures Discourse forum software.

## Requirements

- Ubuntu 14.04
- Environment that supports running a Docker Engine daemon (e.g., not a Docker container itself)

## Attributes

`node['cdo-discourse']['akismet_api_key']`: API key for [Akismet spam plugin](https://github.com/discourse/discourse-akismet).

## Running Tests
The integration tests run using [Test Kitchen](http://kitchen.ci/).

Because this cookbook uses a Docker container, it cannot run with the default `kitchen-docker` driver, so it uses the
`kitchen.ec2.yml` settings by default.

To test the cookbook, run `bundle install` to install `test-kitchen` and dependencies, then run:
- `bundle exec kitchen create` to create the machine image
- `bundle exec kitchen converge` to install Chef and converge the cookbook in the
  platform environment
- `bundle exec kitchen verify` to run the integration test suite
- `bundle exec kitchen destroy` to destroy the machine image and free resources
