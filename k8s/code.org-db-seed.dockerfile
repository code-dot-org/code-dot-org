# syntax=docker/dockerfile:1

FROM scratch

ARG UID=1000

COPY --chown=${UID} --link dashboard/config/scripts dashboard/config/scripts
COPY --chown=${UID} --link dashboard/config/scripts_json dashboard/config/scripts_json