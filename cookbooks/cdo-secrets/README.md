# cdo-secrets

Synchronizes Chef-attribute config/secrets with application config/secrets.

If `cdo-repository` is active this cookbook will load `[CDO]/deployment.rb`, making the `CDO` application config available to the Chef environment.
