# cdo-varnish Cookbook

Installs and configures Varnish HTTP cache.

## Requirements

Ubuntu 18.04

#### apt packages installed (from PPA)

- `varnish`
- `varnish-modules`
- `libvmod-accept` (built from source)

## Attributes

`node['cdo-varnish']['cookie_headers']`: Map of [cookie key] => [HTTP header] extractions.
Varnish will extract the listed cookies into custom HTTP request headers before forwarding to the origin.

## `HttpCache#config`

Provides application-specific cache configuration used by Varnish and other
HTTP cache layers.
`pegasus` and `dashboard` keys each return a Hash in the following format:

- `behaviors`: Array of behaviors. For a given HTTP request, `behaviors` is searched in-order
  until the first matching `path` is found. If no `path` matches the request, the `default` behavior is used.
  - `path`: Path string to match this behavior against.
    A single `*`-wildcard is required, either an extension-wildcard `/*.jpg` or
    path-wildcard `/api/*`.
    - `path` can be a String or an Array. If it is an Array, a separate
      behavior will be generated for each element.
    - Paths match the CloudFront [path pattern](http://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/distribution-web-values-specify.html#DownloadDistValuesPathPattern)
      syntax, with additional restrictions:
      - `?` and `&` characters are not allowed.
      - Only a single `*` wildcard is allowed at the start or end of the path pattern.
  - `headers` (CloudFront-only): Cache objects based on additional HTTP request headers.
    To include all headers (which disables caching entirely for the path), pass `['*']`.
    To include no additional request headers in the cache key, pass `[]`.
    - Note: Objects are already cached based on the `Host` header by default.
    - Note: `headers` is currently only used by CloudFront, while Varnish
      caches objects based on the `Vary` HTTP response header.
  - `cookies`: An allowlist array of HTTP cookie keys to pass to the origin and
    include in the cache key.
    To allowlist all cookies for the path, pass `'all'`.
    To strip all cookies for the path, pass `'none'`.
  - `proxy` (Varnish-only): If specified, proxy all requests matching this path to the
    specified origin. (Currently either `'dashboard'` or `'pegasus'`)
    - Note: paths are not rewritten, so e.g., a GET request
      to `server1.code.org/here/abc` configured with the behavior
      `{path: '/here/*' proxy: 'dashboard' }` will proxy its request to
      `server1-studio.code.org/here/abc`.
    - Note: `proxy` is not yet implemented in CloudFront.
      (Proxies will still work correctly when passed through to Varnish.)
- `default`: Default behavior if no other path patterns are matched.
  Uses the same syntax as `behaviors` except `path` is not required.

## Running Tests

The integration tests run using [Test Kitchen](http://kitchen.ci/).
See `test/cookbooks/varnish_test/README.md` for more details.

To test the cookbook, first make sure Docker is installed and running locally,
run `bundle install` to install `test-kitchen` and dependencies, then run:

- `bundle exec kitchen create` to create the machine image
- `bundle exec kitchen converge` to install Chef and converge the cookbook in the
  platform environment
- `bundle exec kitchen verify` to run the integration test suite
