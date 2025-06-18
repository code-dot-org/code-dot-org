# syntax=docker/dockerfile:1

FROM scratch

ARG UID=1000

COPY --chown=${UID} --link pegasus pegasus

LABEL org.opencontainers.image.source="https://github.com/code-dot-org/code-dot-org"
