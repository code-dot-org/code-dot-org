#!/bin/bash

# Run cookbook integration tests using Chef Kitchen.
bundle install -j`nproc`
(cd cdo-ruby; kitchen verify)
