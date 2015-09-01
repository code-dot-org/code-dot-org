#!/bin/bash

# Run cookbook integration tests using Chef Kitchen.
bundle install -j`nproc`
(cd cdo-ruby; bundle exec kitchen verify)
(cd cdo-varnish; bundle exec kitchen verify)
