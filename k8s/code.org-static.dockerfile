# syntax=docker/dockerfile:1

FROM scratch

COPY --link dashboard/app/assets dashboard/app/assets
COPY --link dashboard/public dashboard/public
COPY --link apps/static apps/static
COPY --link shared shared
COPY --link apps/i18n apps/i18n
COPY --link i18n/locales i18n/locales
COPY --link dashboard/config/locales dashboard/config/locales