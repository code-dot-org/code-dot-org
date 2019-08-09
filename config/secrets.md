# Secrets

We use a custom process (see [#30036](https://github.com/code-dot-org/code-dot-org/pull/30036)) for storing and using secrets within our application, using a custom `!Secret` YAML tag. This tag marks certain keys as Secrets to be lazy-loaded from the [AWS Secrets Manager](https://aws.amazon.com/secrets-manager/) service through calls to the [`GetSecretValue`](https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html) API.

### Referencing a secret
`!Secret`-tagged config keys (e.g.: `my_secret: !Secret`) are all mapped onto the `CDO` application-config namespace as usual, so you can reference a secret using `CDO.my_secret` in application code.

* Secrets are lazy-loaded, so the call to `GetSecretValue` will only take place when the secret is referenced.
  * An exception is running the application-server (in non-`development` environments), where all secrets are explicitly eager-loaded (before the application-server forks multiple processes), and will fail with an exception if the API fails or any expected secrets are not found.
* Secrets are cached in-memory once fetched to ensure only one API call per secret when the application is running.
* Secrets are stored and fetched separately based on the environment, so referencing `CDO.my_secret` actually fetches the secret named `staging/cdo/my_secret`, `production/cdo/my_secret`, etc depending on the environment.
* AWS access permissions are tuned so that the application has read-only access to secrets in its own environment (e.g., a `staging` application can't read `production` secrets), for security purposes.
  * The `Developer` role is also prevented from reading secrets outside of the `development` environment for a better security posture.

### Creating/updating a secret
* Create a `config/secrets.yml` file (see [`secrets.yml.template`](secrets.yml.template) as a reference) containing the configuration for the secrets you wish to create/update, then run the [`bin/update_secrets`](../bin/update_secrets) helper script to apply the changes.
* Update the application configuration files (`config.yml.erb` / `config/[env].yml.erb`) with `!Secret` tags for each environment where the secret now exists.
* Remember that all secrets (except those in `development`) are write-only by developers for security reasons- you shouldn't ever need to read a secret's actual value once written (leave that to the environment-specific application).