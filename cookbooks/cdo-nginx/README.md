# cdo-nginx Cookbook
Installs and configures Nginx buffering proxy.

## Requirements
Ubuntu 14.04

#### apt packages installed (from PPA)
- `nginx`

## Running Tests
The integration tests run using [Test Kitchen](http://kitchen.ci/).
See `test/cookbooks/nginx_test/README.md` for more details.

To test the cookbook, first make sure Docker is installed and running locally,
run `bundle install` to install `test-kitchen` and dependencies, then run:
- `bundle exec kitchen create` to create the machine image
- `bundle exec kitchen converge` to install Chef and converge the cookbook in the
  platform environment
- `bundle exec kitchen verify` to run the integration test suite
