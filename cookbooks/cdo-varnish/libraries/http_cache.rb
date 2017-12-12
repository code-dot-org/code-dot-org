# HTTP Cache configuration.
#
# See cdo-varnish/README.md for more information on the configuration format.
class HttpCache
  # Paths for files that are always cached based on their extension.
  STATIC_ASSET_EXTENSION_PATHS = %w(css js mp3 jpg png).map {|ext| "/*.#{ext}"}.freeze

  # Language header and cookie are needed to separately cache language-specific pages.
  LANGUAGE_HEADER = %w(Accept-Language).freeze

  DEFAULT_COOKIES = [
    # Language drop-down selection.
    'language_',
    # Page mode, for A/B experiments and feature-flag rollouts.
    'pm'
  ]

  # A map from script name to script level URL pattern.
  CACHED_SCRIPTS_MAP = %w(
    starwars
    starwarsblocks
    mc
    frozen
    gumball
    minecraft
    hero
    sports
    basketball
  ).map do |script_name|
    # Most scripts use the default route pattern.
    [script_name, "/s/#{script_name}/stage/*"]
  end.to_h.merge(
    # Add the "special case" routes here.
    'hourofcode' => '/hoc/*',
    'flappy' => '/flappy/*'
  ).freeze

  def self.cached_scripts
    CACHED_SCRIPTS_MAP.keys
  end

  # HTTP-cache configuration that can be applied both to CDN (e.g. Cloudfront) and origin-local HTTP cache (e.g. Varnish).
  # Whenever possible, the application should deliver correct HTTP response headers to direct cache behaviors.
  # This hash provides extra application-specific configuration for whitelisting specific request headers and
  # cookies based on the request path.
  def self.config(env)
    env_suffix = env.to_s == 'production' ? '' : "_#{env}"
    session_key = "_learn_session#{env_suffix}"
    storage_id = "storage_id#{env_suffix}"

    # Signed-in user type (student/teacher), or signed-out if cookie is not present.
    user_type = "_user_type#{env_suffix}"
    default_cookies = DEFAULT_COOKIES.concat([user_type])

    # These cookies are whitelisted on all session-specific (not cached) pages.
    whitelisted_cookies = [
      'hour_of_code',
      'progress',
      'lines',
      'scripts',
      'videos_seen',
      'callouts_seen',
      'rack.session',
      session_key,
      storage_id,
    ].concat(default_cookies)

    {
      pegasus: {
        behaviors: [
          {
            path: '/api/hour/*',
            headers: LANGUAGE_HEADER,
            # Allow the company cookie to be read and set to track company users for tutorials.
            cookies: whitelisted_cookies + ['company']
          },
          # For static-asset paths, don't forward any cookies or additional headers.
          {
            path: STATIC_ASSET_EXTENSION_PATHS + %w(/files/* /images/* /assets/* /fonts/*),
            headers: [],
            cookies: 'none'
          },
          # Dashboard-based API paths in Pegasus are session-specific, whitelist all cookies.
          {
            path: %w(
              /v2/*
              /v3/*
              /private*
            ) +
            # TODO: Collapse these paths into /private to simplify Pegasus caching config.
            %w(
              /create-company-profile*
              /edit-company-profile*
              /teacher-dashboard*
              /manage-professional-development-workshops*
              /professional-development-workshop-surveys*
              /pd-program-registration*
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
          }
        ],
        # Remaining Pegasus paths are cached, and vary only on language and default cookies.
        default: {
          headers: LANGUAGE_HEADER,
          cookies: default_cookies
        }
      },
      dashboard: {
        behaviors: [
          {
            # Serve Sprockets-bundled assets directly from the S3 bucket synced via `assets:precompile`.
            #
            path: '/assets/*',
            proxy: 'cdo-assets',
            headers: [],
            cookies: 'none'
          },
          {
            path: %w(
              /v3/assets/*
              /v3/animations/*
              /v3/files/*
            ),
            headers: LANGUAGE_HEADER,
            cookies: whitelisted_cookies
          },
          {
            # Pass through the user agent to the /api/user_progress and
            # /milestone actions so the activity monitor can track script
            # completion by user agent. These responses are never cached so this
            # won't hurt cachability.
            path: %w(
              /api/user_progress/*
              /milestone/*
            ),
            headers: LANGUAGE_HEADER + ['User-Agent'],
            cookies: whitelisted_cookies
          },
          {
            path: CACHED_SCRIPTS_MAP.values,
            headers: LANGUAGE_HEADER,
            cookies: default_cookies
          },
          {
            path: '/api/v1/projects/gallery/public/*',
            headers: [],
            cookies: 'none'
          },
          {
            path: '/api/*',
            headers: LANGUAGE_HEADER,
            cookies: whitelisted_cookies
          },
          {
            # For static-asset paths, don't forward any cookies or additional headers.
            path: STATIC_ASSET_EXTENSION_PATHS + %w(/blockly/media/*),
            headers: [],
            cookies: 'none'
          },
          {
            path: '/v2/*',
            proxy: 'pegasus',
            headers: LANGUAGE_HEADER,
            cookies: whitelisted_cookies
          },
          {
            path: '/v3/files-public/*',
            headers: [],
            cookies: 'none'
          },
        ],
        # Default Dashboard paths are session-specific, whitelist all session cookies and language header.
        default: {
          headers: LANGUAGE_HEADER,
          cookies: whitelisted_cookies
        }
      }
    }
  end

  # Return true if the levels for the given script name can be publicly cached by proxies.
  def self.allows_public_caching_for_script(script_name)
    CACHED_SCRIPTS_MAP.include?(script_name)
  end
end
