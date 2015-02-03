#!/bin/bash

set -e

crowdin-cli download

ruby ./lib/fix-crowdin-codes.rb