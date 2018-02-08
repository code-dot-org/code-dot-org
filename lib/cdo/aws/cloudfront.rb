require_relative '../../../deployment'
require 'digest'
require 'securerandom'
require 'aws-sdk'
require_relative '../../../cookbooks/cdo-varnish/libraries/http_cache'
require_relative '../../../cookbooks/cdo-varnish/libraries/helpers'
require 'active_support/core_ext/object/try'

# Manages application-specific configuration of AWS CloudFront distributions.
module AWS
  class CloudFront
    ALLOWED_METHODS = %w(HEAD DELETE POST GET OPTIONS PUT PATCH).freeze
    CACHED_METHODS = %w(HEAD GET OPTIONS).freeze
    # List from: http://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/HTTPStatusCodes.html#HTTPStatusCodes-cached-errors
    ERROR_CODES = [400, 403, 404, 405, 414, 500, 501, 502, 503, 504].freeze
    # Configure CloudFront to forward these headers for S3 origins.
    S3_FORWARD_HEADERS = %w(
      Access-Control-Request-Headers
      Access-Control-Request-Method
      Origin
    ).freeze
    # Use the same HTTP Cache configuration as cdo-varnish
    HTTP_CACHE = HttpCache.config(rack_env)

    # CloudFront distribution config (`pegasus` and `dashboard`):
    # - `aliases`: whitelist of domains this distribution will use (`*`-wildcards are allowed, e.g. `*.example.com`).
    #   CloudFront does not allow the same domain to be used by multiple distributions.
    # - `origin`: default origin server endpoint. This should point to the load balancer domain.
    # - `log`: `log.bucket` and `log.prefix` specify where to store CloudFront access logs (or disable if `log` is not provided).
    # - `ssl_cert`: ACM domain name for an SSL certificate previously uploaded to AWS.
    #   If not provided, the default *.cloudfront.net SSL certificate is used.
    cloudfront_config = {
      pegasus: {
        aliases: [CDO.pegasus_hostname] + CDO.partners.map {|x| CDO.canonical_hostname("#{x}.code.org")},
        origin: "#{ENV['RACK_ENV']}-pegasus.code.org",
        # ACM domain name
        ssl_cert: 'code.org',
        log: {
          bucket: 'cdo-logs',
          prefix: "#{ENV['RACK_ENV']}-pegasus-cdn"
        }
      },
      dashboard: {
        aliases: [CDO.dashboard_hostname],
        origin: "#{ENV['RACK_ENV']}-dashboard.code.org",
        ssl_cert: 'code.org',
        log: {
          bucket: 'cdo-logs',
          prefix: "#{ENV['RACK_ENV']}-dashboard-cdn"
        }
      },
      hourofcode: {
        aliases: [CDO.hourofcode_hostname],
        origin: "#{ENV['RACK_ENV']}-origin.hourofcode.com",
        ssl_cert: 'hourofcode.com',
        log: {
          bucket: 'cdo-logs',
          prefix: "#{ENV['RACK_ENV']}-hourofcode-cdn"
        }
      }
    }

    # Integration environment has a slightly different setup
    if ENV['RACK_ENV'] == 'integration'
      cloudfront_config[:pegasus][:aliases] << 'cdo-pegasus.ngrok.io'
      cloudfront_config[:pegasus][:origin] = 'cdo-pegasus.ngrok.io'
      cloudfront_config[:dashboard][:aliases] << 'cdo.ngrok.io'
      cloudfront_config[:dashboard][:origin] = 'cdo.ngrok.io'
      puts "CONFIG: #{cloudfront_config}"
    end
    CONFIG = cloudfront_config.freeze

    # File path for caching mappings from CloudFront Distribution id to alias CNAMEs.
    # Reduces number of required API calls to ListDistributions.
    CLOUDFRONT_ALIAS_CACHE = pegasus_dir 'cache', 'cloudfront_aliases.json'

    # Test-stubbable class method.
    def self.alias_cache
      CLOUDFRONT_ALIAS_CACHE
    end

    def self.invalidate_caches
      puts 'Creating CloudFront cache invalidations...'
      cloudfront = Aws::CloudFront::Client.new(
        logger: Logger.new(dashboard_dir('log/cloudfront.log')),
        log_level: :debug,
        http_wire_trace: true
      )
      invalidations = CONFIG.keys.map do |app|
        hostname = CDO.method("#{app}_hostname").call
        id = get_distribution_id(cloudfront, hostname)
        invalidation = cloudfront.create_invalidation(
          {
            distribution_id: id,
            invalidation_batch: {
              paths: {
                quantity: 1,
                items: ['/*'],
              },
              caller_reference: SecureRandom.hex,
            },
          }
        ).invalidation.id
        [app, id, invalidation]
      end
      puts 'Invalidations created.'
      invalidations.map do |app, id, invalidation|
        cloudfront.wait_until(:invalidation_completed, distribution_id: id, id: invalidation) do |waiter|
          waiter.max_attempts = 120 # wait up to 40 minutes for invalidations
          waiter.before_wait {|_| puts "Waiting for #{app} cache invalidation.."}
        end
        puts "#{app} cache invalidated!"
      end
    end

    # Returns the distribution ID matching a given hostname.
    def self.get_distribution_id(cloudfront, hostname)
      distributions = cloudfront.list_distributions.distribution_list.items.map do |dist|
        [dist.id, dist.aliases.items]
      end
      distributions.to_h.select {|_, v| v.include? hostname}.keys.first
    end

    # Returns a CloudFront DistributionConfig in CloudFormation syntax.
    # `app` is a symbol containing the app name (:pegasus, :dashboard or :hourofcode)
    def self.distribution_config(app, origin, aliases, ssl_cert=nil)
      behaviors, cloudfront, config = get_app_config(app)
      {
        Aliases: aliases,
        CacheBehaviors: behaviors,
        Comment: '',
        CustomErrorResponses: ERROR_CODES.map do |error|
          {
            ErrorCachingMinTTL: 0,
            ErrorCode: error,
          }
        end,
        DefaultCacheBehavior: cache_behavior(config[:default]),
        DefaultRootObject: '',
        Enabled: true,
        Logging: {
          Bucket: "#{cloudfront[:log][:bucket]}.s3.amazonaws.com",
          IncludeCookies: false,
          Prefix: cloudfront[:log][:prefix]
        },
        Origins: [
          {
            Id: 'cdo',
            CustomOriginConfig: {
              OriginProtocolPolicy: 'match-viewer',
              OriginSSLProtocols: %w(TLSv1.2 TLSv1.1)
            },
            DomainName: origin,
            OriginPath: '',
          },
          {
            Id: 'cdo-assets',
            DomainName: "#{CDO.assets_bucket}.s3.amazonaws.com",
            OriginPath: "/#{CDO.assets_bucket_prefix}",
            S3OriginConfig: {
              OriginAccessIdentity: ''
            },
          },
        ],
        PriceClass: 'PriceClass_All',
        Restrictions: {
          GeoRestriction: {
            RestrictionType: 'none'
          }
        },
        ViewerCertificate: ssl_cert ? ssl_cert : {
          CloudFrontDefaultCertificate: true,
          MinimumProtocolVersion: 'TLSv1' # accepts SSLv3, TLSv1
        },
        HttpVersion: 'http2'
      }.to_json
    end

    def self.get_app_config(app)
      config = app == :hourofcode ? HTTP_CACHE[:pegasus] : HTTP_CACHE[app]
      cloudfront = CONFIG[app]
      behaviors = config[:behaviors].map do |behavior|
        paths = behavior[:path]
        paths = [paths] unless paths.is_a? Array
        validate_paths paths
        paths.map do |path|
          cache_behavior(behavior, path)
        end
      end.flatten
      return behaviors, cloudfront, config
    end

    # Returns a CloudFront CacheBehavior Hash compatible with AWS CloudFormation.
    def self.cache_behavior(behavior_config, path=nil)
      s3 = behavior_config[:proxy] == 'cdo-assets'
      # Include Host header in CloudFront's cache key to match Varnish for custom origins.
      # Include S3 forward headers for s3 origins.
      headers = behavior_config[:headers] +
        (s3 ? S3_FORWARD_HEADERS : %w(Host CloudFront-Forwarded-Proto))
      cookie_config = behavior_config[:cookies].is_a?(Array) ?
        {
          Forward: 'whitelist',
          WhitelistedNames: behavior_config[:cookies]
        } :
        {
          Forward: behavior_config[:cookies]
        }

      {
        AllowedMethods: ALLOWED_METHODS,
        CachedMethods: CACHED_METHODS,
        Compress: true,
        DefaultTTL: 0,
        ForwardedValues: {
          Cookies: cookie_config,
          # Always explicitly include Host and CloudFront-Forwarded-Proto headers in CloudFront's cache key, to match Varnish defaults.
          Headers: headers,
          QueryString: true
        },
        MaxTTL: 31_536_000, # =1 year,
        MinTTL: 0,
        SmoothStreaming: false,
        TargetOriginId: (s3 ? behavior_config[:proxy] : 'cdo'),
        TrustedSigners: [],
        ViewerProtocolPolicy: 'redirect-to-https'
      }.tap do |behavior|
        behavior[:PathPattern] = path if path
      end
    end
  end
end
