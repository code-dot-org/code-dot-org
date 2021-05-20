# cdo-nginx Cookbook
Installs and configures Nginx buffering proxy.

## Requirements
Ubuntu 18.04

#### apt packages installed (from PPA)
- `nginx`

## Attributes

- `node['cdo-nginx']['common_name']`: Common name used for SSL self-signed certificate.
- `node['cdo-nginx']['ssl_cert']['content']` and `node['cdo-nginx']['ssl_key']['content']`: Provide these attributes
to use an existing SSL certificate. If left blank, a self-signed certificate will be created.

## Running Tests
The integration tests run using [Test Kitchen](http://kitchen.ci/).
See `test/cookbooks/nginx_test/README.md` for more details.

To test the cookbook, first make sure Docker is installed and running locally,
run `bundle install` to install `test-kitchen` and dependencies, then run:
- `bundle exec kitchen create` to create the machine image
- `bundle exec kitchen converge` to install Chef and converge the cookbook in the
  platform environment
- `bundle exec kitchen verify` to run the integration test suite
