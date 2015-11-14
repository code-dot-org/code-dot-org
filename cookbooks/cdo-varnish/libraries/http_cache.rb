# HTTP Cache configuration.
#
# See cdo-varnish/README.md for more information on the configuration format.
class HttpCache

  # Paths for files that are always cached based on their extension.
  STATIC_ASSET_EXTENSION_PATHS = %w(css js mp3 jpg png).map{|ext| "/*.#{ext}"}

  # Language header and cookie are needed to separately cache language-specific pages.
  LANGUAGE_HEADER = %w(Accept-Language)
  LANGUAGE_COOKIE = %w(language_)

# HTTP-cache configuration that can be applied both to CDN (e.g. Cloudfront) and origin-local HTTP cache (e.g. Varnish).
# Whenever possible, the application should deliver correct HTTP response headers to direct cache behaviors.
# This hash provides extra application-specific configuration for whitelisting specific request headers and
# cookies based on the request path.
  def self.config(env)
    env_suffix = env.to_s == 'production' ? '' : "_#{env}"
    session_key = "_learn_session#{env_suffix}"
    storage_id = "storage_id#{env_suffix}"

    whitelisted_cookies = [
      'hour_of_code',
      'language_',
      'progress',
      'puzzle_rating',
      'lines',
      'scripts',
      'videos_seen',
      'callouts_seen',
      session_key,
      storage_id,
    ]
    {
      pegasus: {
        behaviors: [
          {
            path: '/api/hour/*',
            headers: LANGUAGE_HEADER,
            cookies: whitelisted_cookies
          },
          # For static-asset paths, don't forward any cookies or additional headers.
          {
            path: STATIC_ASSET_EXTENSION_PATHS + %w(/files/* /images/* /assets/* /fonts/* ),
            headers: [],
            cookies: 'none'
          },
          # Dashboard-based API paths in Pegasus are session-specific, whitelist all session cookies and language header.
          {
            path: %w(
              /v2/*
              /v3/*
              /private*
            ) +
            # Todo: Collapse these paths into /private to simplify Pegasus caching config
            %w(
              /create-company-profile*
              /edit-company-profile*
              /teacher-dashboard*
              /manage-professional-development-workshops*
              /professional-development-workshop-surveys*
              /ops-dashboard*
              /poste*
            ),
            headers: LANGUAGE_HEADER,
            cookies: whitelisted_cookies
          },
          {
            path: '/dashboardapi/*',
            proxy: 'dashboard',
            headers: LANGUAGE_HEADER,
            cookies: whitelisted_cookies
          },
          {
            path: %w(
              /
              /learn*
              /congrats
            ),
            headers: LANGUAGE_HEADER,
            cookies: LANGUAGE_COOKIE
          }
        ],
        # Remaining Pegasus paths are English-only and don't require any extra headers or cookies.
        default: {
          headers: [],
          cookies: 'none'
        }
      },
      dashboard: {
        behaviors: [
          {
            path: '/v3/assets/*',
            headers: LANGUAGE_HEADER,
            cookies: whitelisted_cookies
          },
          # Turn off cookie stripping for the starwars script until we fix the bug where users are
          # logged out after visiting this level. This must be re-enable before HOC 2015 to get
          # the benefits of the CDN.
          #
          # {
          # path: "/s/starwars/stage/1/puzzle/*",
          # headers: LANGUAGE_HEADER,
          # cookies: LANGUAGE_COOKIE
          # },
          {
            path: '/api/*',
            headers: LANGUAGE_HEADER,
            cookies: whitelisted_cookies
          },
          {
            # For static-asset paths, don't forward any cookies or additional headers.
            path: STATIC_ASSET_EXTENSION_PATHS + %w(/assets/* /blockly/media/*),
            headers: [],
            cookies: 'none'
          },
          {
            path: '/v2/*',
            proxy: 'pegasus',
            headers: LANGUAGE_HEADER,
            cookies: whitelisted_cookies
          }
        ],
        # Default Dashboard paths are session-specific, whitelist all session cookies and language header.
        default: {
          headers: LANGUAGE_HEADER,
          cookies: whitelisted_cookies
        }
      }
    }
  end
end
