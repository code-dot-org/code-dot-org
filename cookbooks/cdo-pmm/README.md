# cdo-pmm Cookbook
Installs and configures Percona Monitoring and Management (PMM) server.

## Requirements

- Ubuntu 14.04
- Docker Engine installed and service running (e.g., via `cdo-docker`)

## Attributes

## Running Tests
The integration tests run using [Test Kitchen](http://kitchen.ci/).

To test the cookbook, run `bundle install` to install `test-kitchen` and dependencies, then run:
- `bundle exec kitchen create` to create the machine image
- `bundle exec kitchen converge` to install Chef and converge the cookbook in the
  platform environment
- `bundle exec kitchen verify` to run the integration test suite
- `bundle exec kitchen destroy` to destroy the machine image and free resources
