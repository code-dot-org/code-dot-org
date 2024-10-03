#!/bin/bash

# Read PATH from devcontainer defaults
. $HOME/.profile

git lfs pull && \
bundle exec rake install:hooks && \
bundle exec rake install && \
bundle exec rake build
