# cdo-rails: cdo-deps plus the Rails source tree, sliced to what the api and
# worker roles read. See README.md.
#
# Context is the repo root, not this directory:
#   docker build -f docker/rails/Dockerfile --build-arg DEPS_IMAGE=... .

ARG DEPS_IMAGE=ghcr.io/code-dot-org/cdo-deps:latest

FROM ${DEPS_IMAGE}

# Temporarily remove engines because `cdo-deps` already included engine gemspecs.
# COPY merges on top of the parent image and never deletes, so an engine file
# that was deleted in this checkout would otherwise survive from `cdo-deps`.
# The COPY command below restores engines from this checkout.
RUN rm -rf dashboard/engines

# The source slice is defined by Dockerfile.dockerignore.
COPY --chown=1000:1000 . .

# Rails requires both at boot; the dockerignore drops them with their contents.
RUN mkdir -p dashboard/log dashboard/tmp

LABEL org.opencontainers.image.source="https://github.com/code-dot-org/code-dot-org"
