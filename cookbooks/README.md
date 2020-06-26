# `/cookbooks`

This directory contains a collection of 
[Chef Infra](https://docs.chef.io/chef_overview/) 
[cookbooks](https://docs.chef.io/cookbooks/) and 
[recipes](https://docs.chef.io/recipes/) 
to provision+configure the `code-dot-org` repository, Ruby applications and various OS components and services to servers.

The top-level cookbook/recipe is [`cdo-apps`](cdo-apps)`::`[`default`](cdo-apps/recipes/default.rb) , which includes most all other recipes used to provision+configure the applications.

## How cookbooks are used

These cookbooks are used to provision applications to `production` and other managed-infrastructure server environments.
In these managed environments, the [application's CloudFormation template](../aws/cloudformation/cloud_formation_stack.yml.erb) 
provides its EC2 instances with a
[cloud-init user-data script](https://cloudinit.readthedocs.io/en/latest/topics/format.html#user-data-script) 
that includes the [`bootstrap_chef_stack.sh.erb`](../aws/cloudformation/bootstrap_chef_stack.sh.erb) script-template, 
which [installs the Chef Client](https://docs.chef.io/chef_install_script/) and invokes the 
[`chef-client`](https://docs.chef.io/ctl_chef_client/) executable which runs the specified cookbooks/recipes.

Currently, managed environments run [`update_cookbook_versions`](./update_cookbook_versions) and package/upload
versioned cookbooks to a hosted [Chef Infra Server](https://docs.chef.io/server_overview/) as part of their CI build,
then connect to that server with `chef-client` to provision.

`adhoc` environments work slightly differently by running `chef-client` in
[Local Mode](https://docs.chef.io/ctl_chef_client/#run-in-local-mode) against locally-stored cookbooks.
This is much simpler and will eventually become the default provisioning mode for all environments.

In the future, Chef cookbooks may also be used to provision applications to Docker images/layers and/or local-development workstations.

## Testing cookbooks

We aim to follow best practices for [test driven infrastructure with Chef](https://blog.chef.io/overview-of-test-driven-infrastructure-with-chef/),
though tools and techniques are rapidly evolving, and overall coverage is still far from complete. Currently, we try to
cover basic functionality with integration tests for any new development or changes to existing cookbooks, so that we can
test the behavior of a cookbook/recipe in isolation without having to provision the entire application stack.

### Test Kitchen Integration Testing
Chef integration tests run using [Test Kitchen](http://kitchen.ci/), are located in the `test/` subdirectory in each cookbook, and are configured by [`.kitchen.yml`](https://docs.chef.io/workstation/config_yml_kitchen/) files.

To test a cookbook, run `bundle install` to install `test-kitchen` and dependencies, `cd` to the cookbook directory, then run:
- `bundle exec kitchen create` to create the platform environment (e.g., Docker container, EC2 instance)
- `bundle exec kitchen converge` to install Chef and converge the cookbook in the
  platform environment
- `bundle exec kitchen verify` to run the integration test suite
- `bundle exec kitchen destroy` to destroy the created platform environment and release associated resources

### Docker driver

Tests run by default on Docker containers using the [`kitchen-docker`](https://github.com/portertech/kitchen-docker) driver.
First make sure Docker is installed and running locally.

### AWS EC2 driver

Tests can be configured to run on live Amazon EC2 instances using the [`kitchen-ec2`](https://github.com/test-kitchen/kitchen-ec2) driver.

To use the EC2 configuration instead of Docker, run (from within the cookbook directory):
```bash
KITCHEN_LOCAL_YAML=../.kitchen.ec2.yml bundle exec kitchen [create|converge|verify|destroy]
```

Note that the live EC2 instance will continue consuming resources until `destroy` is called,
so make sure to do this at the end of your testing!
