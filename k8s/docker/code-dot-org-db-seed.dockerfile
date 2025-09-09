# syntax=docker/dockerfile:1

FROM scratch

ARG UID=1000

COPY --chown=${UID} --link dashboard/config/scripts dashboard/config/scripts
COPY --chown=${UID} --link dashboard/config/scripts_json dashboard/config/scripts_json
COPY --chown=${UID} --link dashboard/config/levels dashboard/config/levels

LABEL org.opencontainers.image.source="https://github.com/code-dot-org/code-dot-org"
