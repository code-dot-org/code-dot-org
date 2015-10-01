# cdo-varnish Cookbook
Installs and configures Varnish HTTP cache.

## Requirements
Ubuntu 14.04

#### apt packages installed (from PPA)
- `varnish`
- `libvmod-cookie`
- `libvmod-header`

## `HttpCache#config`

Provides application-specific cache configuration used by Varnish and other
HTTP cache layers.
`pegasus` and `dashboard` keys each return a Hash in the following format:

- `behaviors`: Array of behaviors, evaluated in top-to-bottom order:
  - `path`: Path string to match this behavior against.
    A single `*`-wildcard is required, either an extension-wildcard `*.jpg` or
    path-wildcard `api/*`.
    - `path` can be a String or an Array. If it is an Array, a separate
      behavior will be generated for each element.
    - Paths match the CloudFront [path pattern](http://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/distribution-web-values-specify.html#DownloadDistValuesPathPattern)
      syntax, with additional restrictions:
      - `?` and `&` characters are not allowed.
      - Only a single `*` wildcard is allowed at the start or end of the path pattern.
  - `headers`: A whitelist array of HTTP header keys to pass to the origin and
    include in the cache key.
    To whitelist all headers for the path, pass `['*']`.
    To strip all headers for the path, pass `[]`.
  - `cookies`: A whitelist array of HTTP cookie keys to pass to the origin and
    include in the cache key.
    To whitelist all cookies for the path, pass `'all'`.
    To strip all cookies for the path, pass `'none'`.
  - `proxy`: If specified, proxy all requests matching this path to the
    specified origin. (Currently either `'dashboard'` or `'pegasus'`)
    - Note: CloudFront does not support path-rewriting, so e.g., a GET request
      to `server1.code.org/here/abc` configured with the behavior
      `{path: 'here/*' proxy: 'dashboard' }` will proxy its request to
      `server1-studio.code.org/here/abc`.
- `default`: Default behavior if no other path patterns are matched.
  Uses the same syntax as `behaviors` except `path` is not required.

## Running Tests
The integration tests run using [Test Kitchen](http://kitchen.ci/).
See `test/cookbooks/varnish_test/README.md` for more details.

To test the cookbook, first make sure Docker is installed and running locally,
then run:
- `chef exec kitchen create` to create the machine image
- `chef exec kitchen converge` to install Chef and converge the cookbook in the
  platform environment
- `chef exec kitchen verify` to run the integration test suite
