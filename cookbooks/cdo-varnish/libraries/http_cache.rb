# HTTP Cache configuration.
#
# See cdo-varnish/README.md for more information on the configuration format.
class HttpCache
  STATIC_ASSETS = {
    # For static-asset extensions, don't forward any cookies or headers.
    path: %w(cur pdf png gif jpeg jpg ico mp3 swf css js).map{|ext| "*.#{ext}"},
    headers: [],
    cookies: 'none'
  }

# Host header is needed for Varnish to delegate to pegasus/dashboard depending on the host.
# Accept-Language header is needed to cache language-specific pages.
  ALL_HEADERS = %w(Host Accept-Language)
  LANGUAGE_COOKIE = %w(language_)

# HTTP-cache configuration that can be applied both to CDN (e.g. Cloudfront) and origin-local HTTP cache (e.g. Varnish).
# Whenever possible, the application should deliver correct HTTP response headers to direct cache behaviors.
# This hash provides extra application-specific configuration for whitelisting specific request headers and
# cookies based on the request path.
  def self.config(session_key, storage_id)
    all_cookies = [
      'hour_of_code',
      'language_',
      'progress',
      'lines',
      session_key,
      storage_id,
    ]
    {
      pegasus: {
        behaviors: [
          {
            path: 'api/hour/*',
            headers: ALL_HEADERS,
            cookies: all_cookies
          },
          STATIC_ASSETS,
          # Dashboard-based API paths in Pegasus are session-specific, whitelist all session cookies and language headers.
          {
            path: %w(
              v2/*
              v3/*
              private*
            ) +
            # Todo: Collapse these paths into /private to simplify Pegasus caching config
            %w(
              create-company-profile*
              edit-company-profile*
              teacher-dashboard*
              manage-professional-development-workshops*
              professional-development-workshop-surveys*
              ops-dashboard*
              poste*
            ),
            headers: ALL_HEADERS,
            cookies: all_cookies
          },
          {
            path: 'dashboardapi/*',
            proxy: 'dashboard',
            headers: ALL_HEADERS,
            cookies: all_cookies
          }
        ],
        # Default Pegasus paths are cached but language-specific, whitelist only language cookies/headers.
        default: {
          headers: ALL_HEADERS,
          cookies: LANGUAGE_COOKIE
        }
      },
      dashboard: {
        behaviors: [
          {
            path: 'api/*',
            headers: ALL_HEADERS,
            cookies: all_cookies
          },
          STATIC_ASSETS,
          {
            path: 'v2/*',
            proxy: 'pegasus',
            headers: ALL_HEADERS,
            cookies: all_cookies
          }
        ],
        # Default Dashboard paths are session-specific, whitelist all session cookies and language headers.
        default: {
          headers: ALL_HEADERS,
          cookies: all_cookies
        }
      }
    }
  end
end
