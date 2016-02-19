#!/bin/bash

# Runs apps tests split into two groups to avoid high memory usage.
for i in 1 2; do grunt mochaTest --grep solutions/applab --invert && break; done && \
for i in 1 2; do grunt mochaTest --grep solutions/applab && break; done
