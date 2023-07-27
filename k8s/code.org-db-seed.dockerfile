# syntax=docker/dockerfile:1

FROM scratch

COPY --link dashboard/config/scripts dashboard/config/scripts
COPY --link dashboard/config/scripts_json dashboard/config/scripts_json