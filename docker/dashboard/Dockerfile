# cdo-dashboard: cdo-deps plus the Rails source tree. Runs as api or worker;
# migrate and web layer on top. See README.md.
#
# Context is the repo root, not this directory:
#   docker build -f docker/dashboard/Dockerfile --build-arg DEPS_IMAGE=... .

ARG DEPS_IMAGE=ghcr.io/code-dot-org/cdo-gems:latest

FROM ${DEPS_IMAGE}

# cdo-deps ships python/ and the engine gemspecs, and COPY merges rather than
# replaces, so a file deleted upstream would survive from the parent image.
# Drop both trees first; the COPY below restores them from this checkout.
RUN rm -rf python dashboard/engines

# The source slice is defined by Dockerfile.dockerignore.
COPY --chown=1000:1000 . .

# Rails requires both at boot; the dockerignore drops them with their contents.
RUN mkdir -p dashboard/log dashboard/tmp

LABEL org.opencontainers.image.source="https://github.com/code-dot-org/code-dot-org"
