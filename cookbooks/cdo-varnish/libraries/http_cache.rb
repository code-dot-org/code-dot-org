# HTTP Cache configuration.
#
# See cdo-varnish/README.md for more information on the configuration format.
class HttpCache
  # Paths for files that are always cached based on their extension.
  STATIC_ASSET_EXTENSION_PATHS = %w(css js mp3 jpg png).map {|ext| "/*.#{ext}"}.freeze

  # Language header and cookie are needed to separately cache language-specific pages.
  LANGUAGE_HEADER = %w(Accept-Language).freeze
  COUNTRY_HEADER = %w(CloudFront-Viewer-Country).freeze
  ALLOWLISTED_HEADERS = LANGUAGE_HEADER + COUNTRY_HEADER

  DEFAULT_COOKIES = [
    # Language drop-down selection.
    'language_',
    # Page mode, for A/B experiments and feature-flag rollouts.
    'pm'
  ].freeze

  # A list of script levels that should not be cached, even though they are
  # in a cacheable script, because they are project-backed.
  UNCACHED_SCRIPT_LEVEL_PATHS = [
    '/s/dance/lessons/1/levels/13',
    '/s/dance-2019/lessons/1/levels/10'
  ]

  # A map from script name to script level URL pattern.
  CACHED_SCRIPTS_MAP = %w(
    aquatic
    starwars
    starwarsblocks
    mc
    frozen
    gumball
    minecraft
    hero
    sports
    basketball
    dance
    dance-2019
    oceans
  ).map do |script_name|
    # Most scripts use the default route pattern.
    [script_name, "/s/#{script_name}/lessons/*"]
  end.to_h.merge(
    # Add the "special case" routes here.
    'hourofcode' => '/hoc/*',
    'flappy' => '/flappy/*'
  ).freeze

  def self.cached_scripts
    CACHED_SCRIPTS_MAP.keys
  end

  ALLOWED_WEB_REQUEST_HEADERS = %w(
    Authorization
  )

  # HTTP-cache configuration that can be applied both to CDN (e.g. Cloudfront) and origin-local HTTP cache (e.g. Varnish).
  # Whenever possible, the application should deliver correct HTTP response headers to direct cache behaviors.
  # This hash provides extra application-specific configuration for allowlisting specific request headers and
  # cookies based on the request path.
  def self.config(env)
    env_suffix = env.to_s == 'production' ? '' : "_#{env}"
    session_key = "_learn_session#{env_suffix}"
    storage_id = "storage_id#{env_suffix}"

    # Signed-in user type (student/teacher), or signed-out if cookie is not present.
    user_type = "_user_type#{env_suffix}"
    # Students younger than 13 shouldn't see App Lab and Game Lab unless they
    # are in a teacher's section for privacy reasons.
    limit_project_types = "_limit_project_types#{env_suffix}"
    # Whether admin has assumed current identity
    assumed_identity = "_assumed_identity#{env_suffix}"
    default_cookies = DEFAULT_COOKIES + [user_type, limit_project_types, assumed_identity]

    # These cookies are allowlisted on all session-specific (not cached) pages.
    allowlisted_cookies = [
      'hour_of_code',
      'progress',
      'lines',
      'scripts',
      'videos_seen',
      'callouts_seen',
      'rack.session',
      'remember_user_token',
      '__profilin', # Used by rack-mini-profiler
      session_key,
      storage_id,
    ].concat(default_cookies)

    {
      pegasus: {
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
            path: '/api/hour/*',
            headers: ALLOWLISTED_HEADERS,
            # Allow the company cookie to be read and set to track company users for tutorials.
            cookies: allowlisted_cookies + ['company']
          },
          # For static-asset paths, don't forward any cookies or additional headers.
          {
            path: STATIC_ASSET_EXTENSION_PATHS + %w(/files/* /images/* /fonts/*),
            headers: [],
            cookies: 'none'
          },
          # Dashboard-based API paths in Pegasus are session-specific, allowlist all cookies.
          {
            path: %w(
              /v2/*
              /v3/*
              /private*
            ) +
            # TODO: Collapse these paths into /private to simplify Pegasus caching config.
            %w(
              /amazon-future-engineer*
              /create-company-profile*
              /edit-company-profile*
              /teacher-dashboard*
              /manage-professional-development-workshops*
              /professional-development-workshop-surveys*
              /pd-program-registration*
              /poste*
            ),
            headers: ALLOWLISTED_HEADERS,
            cookies: allowlisted_cookies
          },
          {
            path: '/dashboardapi/*',
            proxy: 'dashboard',
            headers: ALLOWLISTED_HEADERS,
            cookies: allowlisted_cookies
          },
          {
            path: '/i18n/track_string_usage',
            proxy: 'dashboard',
            headers: ALLOWLISTED_HEADERS,
            cookies: allowlisted_cookies
          },
          # Cached paths that specifically filter query-parameters.
          {
            path: %w(
              /
            ),
            query: false,
            headers: ALLOWLISTED_HEADERS,
            cookies: default_cookies
          }
        ],
        # Remaining Pegasus paths are cached, and vary only on language, country, and default cookies.
        default: {
          headers: LANGUAGE_HEADER + COUNTRY_HEADER,
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
            path: '/restricted/*',
            proxy: 'cdo-restricted',
            headers: [],
            cookies: 'none',
            trusted_signer: true,
          },
          {
            path: %w(
              /v3/assets/*
              /v3/animations/*
              /v3/files/*
              /v3/libraries/*
            ),
            headers: ALLOWLISTED_HEADERS,
            cookies: allowlisted_cookies
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
            headers: ALLOWLISTED_HEADERS + ['User-Agent'],
            cookies: allowlisted_cookies
          },
          # Some script levels in cacheable scripts are project-backed and
          # should not be cached in CloudFront. Use CloudFront Behavior
          # precedence rules to not cache these paths, but all paths in
          # CACHED_SCRIPTS_MAP that don't match this path will be cached.
          {
            path: UNCACHED_SCRIPT_LEVEL_PATHS,
            headers: ALLOWLISTED_HEADERS,
            cookies: allowlisted_cookies
          },
          {
            path: CACHED_SCRIPTS_MAP.values,
            headers: ALLOWLISTED_HEADERS,
            cookies: default_cookies
          },
          {
            path: '/api/v1/projects/gallery/public/*',
            headers: [],
            cookies: 'none'
          },
          {
            path: '/api/v1/sound-library/*',
            headers: [],
            cookies: 'none'
          },
          {
            path: '/api/*',
            headers: ALLOWLISTED_HEADERS,
            cookies: allowlisted_cookies
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
            headers: ALLOWLISTED_HEADERS,
            cookies: allowlisted_cookies
          },
          {
            path: %w(
              /v3/files-public/*
              /v3/sources-public/*
            ),
            headers: [],
            cookies: 'none'
          },
          {
            path: '/xhr*',
            headers: ALLOWLISTED_HEADERS + ALLOWED_WEB_REQUEST_HEADERS,
            cookies: allowlisted_cookies
          },
          {
            path: '/curriculum_tracking_pixel',
            headers: [],
            cookies: allowlisted_cookies
          }
        ],
        # Default Dashboard paths are session-specific, allowlist all session cookies and language header.
        default: {
          headers: ALLOWLISTED_HEADERS,
          cookies: allowlisted_cookies
        }
      }
    }
  end

  def self.uncached_script_level_path?(script_level_path)
    UNCACHED_SCRIPT_LEVEL_PATHS.include?(script_level_path)
  end

  # Return true if the levels for the given script name can be publicly cached by proxies.
  def self.allows_public_caching_for_script(script_name)
    CACHED_SCRIPTS_MAP.include?(script_name)
  end
end
