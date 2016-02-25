## About Chef Integration Tests
Chef integration tests run using [Test Kitchen](http://kitchen.ci/).

To test the cookbook, run `bundle install` to install `test-kitchen` and dependencies, then run:
- `bundle exec kitchen create` to create the machine image
- `bundle exec kitchen converge` to install Chef and converge the cookbook in the
  platform environment
- `bundle exec kitchen verify` to run the integration test suite
- `bundle exec kitchen destroy` to destroy the running machine image and release associated resources

## Automatic Tests in CircleCI

Cookbook tests will automatically run within CircleCI build for branches that match a `cdo-*` cookbook name.

For example, a branch named `mysql-update` will match the `cdo-mysql` cookbook, and will run its integration
tests on each commit.

### Docker

Tests run by default on Docker using the [`kitchen-docker`](https://github.com/portertech/kitchen-docker) driver.
First make sure Docker is installed and running locally.

### AWS EC2

Tests can be configured to run on live Amazon EC2 instances using the [`kitchen-ec2`](https://github.com/test-kitchen/kitchen-ec2) driver.

To use the EC2 configuration instead of Docker, run (from within the `cdo-apps/` folder):
```bash
KITCHEN_LOCAL_YAML=../.kitchen.ec2.yml bundle exec kitchen [create|converge|verify|destroy]
```

Note that the live EC2 instance will continue consuming resources until `destroy` is called,
so make sure to do this at the end of your testing!
