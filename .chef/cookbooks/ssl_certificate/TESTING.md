Testing
=======

## Required Gems

* `yard`
* `vagrant`
* `foodcritic`
* `rubocop`
* `berkshelf`
* `simplecov`
* `should_not`
* `chefspec`
* `test-kitchen`
* `kitchen-vagrant`

### Required Gems for Guard

* `guard`
* `guard-foodcritic`
* `guard-rubocop`
* `guard-rspec`
* `guard-kitchen`

More info at [Guard Readme](https://github.com/guard/guard#readme).

## Installing the Requirements

You must have [VirtualBox](https://www.virtualbox.org/) and [Vagrant](http://www.vagrantup.com/) installed.

You can install gem dependencies with bundler:

    $ gem install bundler
    $ bundle install --without travis

## Generating the Documentation

    $ bundle exec rake doc

## Running the Syntax Style Tests

    $ bundle exec rake style

## Running the Unit Tests

    $ bundle exec rake unit

## Running the Integration Tests

    $ bundle exec rake integration:vagrant

Or:

    $ bundle exec kitchen list
    $ bundle exec kitchen test
    [...]

### Running Integration Tests in Docker

You need to have [Docker installed](https://docs.docker.com/installation/).

    $ wget -qO- https://get.docker.com/ | sh

Then use the `integration:docker` rake task to run the tests:

    $ bundle exec rake integration:docker

### Running Integration Tests in the Cloud

#### Requirements

* `kitchen-digitalocean`
* `kitchen-ec2`

You can run the tests in the cloud instead of using vagrant. First, you must set the following environment variables:

* `AWS_ACCESS_KEY_ID`
* `AWS_SECRET_ACCESS_KEY`
* `AWS_KEYPAIR_NAME`: EC2 SSH public key name. This is the name used in Amazon EC2 Console's Key Pars section.
* `EC2_SSH_KEY_PATH`: EC2 SSH private key local full path. Only when you are not using an SSH Agent.
* `DIGITALOCEAN_ACCESS_TOKEN`
* `DIGITALOCEAN_SSH_KEY_IDS`: DigitalOcean SSH numeric key IDs.
* `DIGITALOCEAN_SSH_KEY_PATH`: DigitalOcean SSH private key local full path. Only when you are not using an SSH Agent.

Then use the `integration:cloud` rake task to run the tests:

    $ bundle exec rake integration:cloud
