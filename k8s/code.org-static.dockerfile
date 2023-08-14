# syntax=docker/dockerfile:1

FROM scratch

ARG UID=1000

COPY --chown=${UID} --link dashboard/app/assets dashboard/app/assets
COPY --chown=${UID} --link dashboard/public dashboard/public
COPY --chown=${UID} --link apps/static apps/static
COPY --chown=${UID} --link shared/images shared/images
COPY --chown=${UID} --link apps/i18n apps/i18n
COPY --chown=${UID} --link i18n/locales i18n/locales
COPY --chown=${UID} --link dashboard/config/locales dashboard/config/locales

COPY --chown=${UID} --link pegasus/sites.v3 pegasus/sites.v3
COPY --chown=${UID} --link pegasus/sites pegasus/sites