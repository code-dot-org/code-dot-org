# Experiments Plugin

Reads the set of experiments enabled for the current browser.

## Availability

Available from the `@code-dot-org/core/plugins/experiments` subpath.

## No registration

There is nothing to configure at boot, so this plugin exports no `CorePlugin`
and is not passed to `initializeCore`. Import the function and call it.

```typescript
import {getEnabledExperiments} from '@code-dot-org/core/plugins/experiments';

const experiments = getEnabledExperiments();
```

## Sources

Two stores are read and concatenated, cookie-mirrored entries first:

- the `_experiments` cookie, which Rails writes at sign-in. Its name is
  suffixed per environment by `window.cookieEnvSuffix`; a page that does not
  render that global reads the unsuffixed name, so a non-production deployment
  finds no cookie rather than the wrong one.
- the `experimentsList` localStorage entry, which the browser manages. Entries
  carrying an `expiration` in the past are dropped from the result.

Reading only: nothing here enables, disables, or prunes an experiment. An
unreadable or malformed store yields an empty list rather than an error.
