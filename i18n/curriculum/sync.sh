#!/bin/bash

set -e

crowdin-cli upload sources
crowdin-cli download

ruby ../code.org/lib/fix-crowdin-codes.rb