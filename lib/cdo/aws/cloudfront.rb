require_relative '../../../deployment'
require 'digest'
require 'aws-sdk'
require_relative '../../../cookbooks/cdo-varnish/libraries/http_cache'
require_relative '../../../cookbooks/cdo-varnish/libraries/helpers'

# Manages application-specific configuration and deployment of AWS CloudFront distributions.
module AWS
  class CloudFront

    ALLOWED_METHODS = %w(HEAD DELETE POST GET OPTIONS PUT PATCH)
    CACHED_METHODS = %w(HEAD GET OPTIONS)
    # List from: http://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/HTTPStatusCodes.html#HTTPStatusCodes-cached-errors
    ERROR_CODES = [400, 403, 404, 405, 414, 500, 501, 502, 503, 504]

    # Use the same HTTP Cache configuration as cdo-varnish
    HTTP_CACHE = HttpCache.config(rack_env)

    # CloudFront distribution config (`pegasus` and `dashboard`):
    # - `aliases`: whitelist of domains this distribution will use (`*`-wildcards are allowed, e.g. `*.example.com`).
    #   CloudFront does not allow the same domain to be used by multiple distributions.
    # - `origin`: default origin server endpoint. This should point to the load balancer domain.
    # - `log`: `log.bucket` and `log.prefix` specify where to store CloudFront access logs (or disable if `log` is not provided).
    # - `ssl_cert`: IAM server certificate name for a SSL certificate previously uploaded to AWS.
    #   If not provided, the default *.cloudfront.net SSL certificate is used.
    CONFIG = {
      pegasus: {
        aliases: [CDO.pegasus_hostname] + (['i18n'] + CDO.partners).map{|x| CDO.canonical_hostname("#{x}.code.org")},
        origin: "#{ENV['RACK_ENV']}-pegasus.code.org",
        # IAM server certificate name
        ssl_cert: 'codeorg-cloudfront',
        log: {
          bucket: 'cdo-logs',
          prefix: "#{ENV['RACK_ENV']}-pegasus-cdn"
        }
      },
      dashboard: {
        aliases: [CDO.dashboard_hostname],
        origin: "#{ENV['RACK_ENV']}-dashboard.code.org",
        ssl_cert: 'codeorg-cloudfront',
        log: {
          bucket: 'cdo-logs',
          prefix: "#{ENV['RACK_ENV']}-dashboard-cdn"
        }
      },
      hourofcode: {
        aliases: [CDO.hourofcode_hostname],
        origin: "#{ENV['RACK_ENV']}-origin.hourofcode.com",
        ssl_cert: 'hourofcode-cloudfront',
        log: {
          bucket: 'cdo-logs',
          prefix: "#{ENV['RACK_ENV']}-hourofcode-cdn"
        }
      }
    }

    # Integration environment has a slightly different setup
    if ENV['RACK_ENV'] == 'integration'
      CONFIG[:pegasus][:aliases] << 'cdo-pegasus.ngrok.io'
      CONFIG[:pegasus][:origin] = 'cdo-pegasus.ngrok.io'
      CONFIG[:dashboard][:aliases] << 'cdo.ngrok.io'
      CONFIG[:dashboard][:origin] = 'cdo.ngrok.io'
      puts "CONFIG: #{CONFIG}"
    end

    # Manually sorts the array-types in the distribution config object,
    # so we can compare against the existing config to detect whether an update is needed.
    def self.sort_config!(config)
      config[:cache_behaviors][:items].sort_by!{|item| item[:path_pattern]}
      config[:cache_behaviors][:items].each do |item|
        item[:forwarded_values][:headers][:items].sort!
        name = item[:forwarded_values][:cookies][:whitelisted_names]
        name[:items].sort! if name
      end
      config[:aliases][:items].sort!
      config[:origins][:items].sort!
      config[:custom_error_responses][:items].sort_by!{|e| e[:error_code]}
    end

    # File path for caching mappings from CloudFront Distribution id to alias CNAMEs.
    # Reduces number of required API calls to ListDistributions.
    CLOUDFRONT_ALIAS_CACHE = pegasus_dir 'cache', 'cloudfront_aliases.json'

    # Test-stubbable class method.
    def self.alias_cache
      CLOUDFRONT_ALIAS_CACHE
    end

    # Creates or updates the CloudFront distribution based on the current configuration.
    # Calls to this method should be idempotent, however CloudFront distribution updates can take ~15 minutes to finish.
    #
    # Ref: http://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/HowToUpdateDistribution.html
    # "Your changes don't propagate to every edge location instantaneously; propagation to all edge locations can take
    #  15 minutes. When propagation is complete, the status of your distribution changes from InProgress to Deployed.
    #  While CloudFront is propagating your changes to edge locations, we cannot determine whether a given edge
    #  location is serving your content based on the previous configuration or the new configuration."
    def self.create_or_update
      cloudfront = Aws::CloudFront::Client.new(logger: Logger.new(dashboard_dir('log/cloudfront.log')),
                                               log_level: :debug,
                                               http_wire_trace: true)
      ids = CONFIG.keys.map do |app|
        hostname = CDO.method("#{app}_hostname").call
        id, distribution_config = get_distribution_config(cloudfront, hostname)
        if distribution_config
          old_config = distribution_config.distribution_config.to_hash
          new_config = config(app, distribution_config.distribution_config.caller_reference)
          sort_config! old_config
          sort_config! new_config
          if old_config == new_config
            puts "#{app} distribution not modified."
          else
            cloudfront.update_distribution(
              id: id,
              if_match: distribution_config.etag,
              distribution_config: config(app, distribution_config.distribution_config.caller_reference)
            )
            puts "#{app} distribution updated!"
          end
        else
          resp = cloudfront.create_distribution(
            distribution_config: config(app)
          )
          id = resp.distribution.id
          puts "#{app} distribution created!"
        end
        [app, id]
      end

      ids.map do |app, id|
        cloudfront.wait_until(:distribution_deployed, id: id) do |waiter|
          waiter.before_wait { |_| puts "Waiting for #{app} distribution to deploy.." }
        end
        puts "#{app} distribution deployed!"
      end
    end

    # Returns the distribution ID and fetched DistributionConfig object for a given hostname.
    # Uses cached mappings first if available.
    def self.get_distribution_config(cloudfront, hostname)
      id = get_distribution_id_with_retry(cloudfront, hostname)
      [id, id && cloudfront.get_distribution_config(id: id)]
    rescue Aws::CloudFront::Errors::NoSuchDistribution
      # Cached id may be stale, try again with an uncached id.
      id = get_distribution_id(false, cloudfront, hostname)
      [id, id && cloudfront.get_distribution_config(id: id)]
    end

    # Calls get_distribution_id, retrying without cache if the result is nil.
    def self.get_distribution_id_with_retry(*args)
      get_distribution_id(true, *args) || get_distribution_id(false, *args)
    end

    # Returns the distribution ID for a given hostname.
    # Uses cached id-to-hostname mappings if cached=true.
    def self.get_distribution_id(cached, cloudfront, hostname)
      mapping =
        # Use cached value first if available.
        cached && File.file?(alias_cache) && JSON.parse(IO.read(alias_cache)) ||
        # Fallback to API call.
        cloudfront.list_distributions.distribution_list.items.map do |dist|
          [dist.id, dist.aliases.items]
        end.to_h.tap do |out|
          # Write result to cache.
          IO.write(alias_cache, JSON.pretty_generate(out))
        end
      mapping.select{ |_, v| v.include? hostname }.keys.first
    end

    # Returns a CloudFront DistributionConfig Hash compatible with the AWS SDK for Ruby v2.
    # Syntax reference: http://docs.aws.amazon.com/sdkforruby/api/Aws/CloudFront/Types/DistributionConfig.html
    # `app` is a symbol containing the app name (:pegasus, :dashboard or :hourofcode)
    def self.config(app, reference = nil)
      behaviors, cloudfront, config = get_app_config(app, method(:cache_behavior))
      ssl_cert = cloudfront[:ssl_cert]
      # Lookup IAM Certificate ID from server certificate name
      server_certificate_id = ssl_cert && Aws::IAM::Client.new.
        get_server_certificate(server_certificate_name: ssl_cert).
        server_certificate.server_certificate_metadata.server_certificate_id
      {
        aliases: {
          quantity: cloudfront[:aliases].length, # required
          items: cloudfront[:aliases].empty? ? nil : cloudfront[:aliases],
        },
        default_root_object: '',
        origins: {# required
          quantity: 1, # required
          items: [
            {
              id: 'cdo', # required
              domain_name: cloudfront[:origin], # required
              origin_path: '',
              custom_origin_config: {
                http_port: 80, # required
                https_port: 443, # required
                origin_protocol_policy: 'match-viewer', # required, accepts http-only, match-viewer
                origin_ssl_protocols: {
                  quantity: 2,
                  items: %w(SSLv3 TLSv1)
                }
              },
              custom_headers: {
                quantity: 0
              }
            },
          ],
        },
        default_cache_behavior: cache_behavior(config[:default]),
        cache_behaviors: {
          quantity: behaviors.length, # required
          items: behaviors.empty? ? nil : behaviors,
        },
        custom_error_responses: {}.tap do |hash|
          hash[:items] = ERROR_CODES.map do |error|
            {
              error_code: error,
              response_code: '',
              response_page_path: '',
              error_caching_min_ttl: 0
            }
          end
          hash[:quantity] = ERROR_CODES.length
        end,
        comment: '', # required
        logging: {
          enabled: !!cloudfront[:log], # required
          include_cookies: false, # required
          bucket: cloudfront[:log] && "#{cloudfront[:log][:bucket]}.s3.amazonaws.com", # required
          prefix: cloudfront[:log] && cloudfront[:log][:prefix], # required
        },
        price_class: 'PriceClass_All', # accepts PriceClass_100, PriceClass_200, PriceClass_All
        enabled: true, # required
        viewer_certificate: ssl_cert ? {
          certificate: server_certificate_id,
          iam_certificate_id: server_certificate_id,
          certificate_source: 'iam',
          ssl_support_method: 'vip', # accepts sni-only, vip
          minimum_protocol_version: 'TLSv1' # accepts SSLv3, TLSv1
        } : {
          cloud_front_default_certificate: true,
          minimum_protocol_version: 'TLSv1' # accepts SSLv3, TLSv1
        },
        restrictions: {
          geo_restriction: {# required
            restriction_type: 'none', # required, accepts blacklist, whitelist, none
            quantity: 0 # required
          },
        },
        web_acl_id: ''
      }.tap do |cf|
        cf[:caller_reference] = reference || Digest::MD5.hexdigest(Marshal.dump(config)) # required
      end
    end

    def self.get_app_config(app, behavior_method)
      config = app == :hourofcode ? HTTP_CACHE[:pegasus] : HTTP_CACHE[app]
      cloudfront = CONFIG[app]
      behaviors = config[:behaviors].map do |behavior|
        paths = behavior[:path]
        paths = [paths] unless paths.is_a? Array
        validate_paths paths
        paths.map do |path|
          behavior_method.call(behavior, path)
        end
      end.flatten
      return behaviors, cloudfront, config
    end

    # Same as #config, except returns a CloudFormation JSON.
    # `app` is a symbol containing the app name (:pegasus, :dashboard or :hourofcode)
    def self.config_cloudformation(app, origin, aliases, ssl_cert=nil)
      behaviors, cloudfront, config = get_app_config(app, method(:cache_behavior_cloudformation))
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
        DefaultCacheBehavior: cache_behavior_cloudformation(config[:default]),
        DefaultRootObject: '',
        Enabled: true,
        Logging: {
          Bucket: "#{cloudfront[:log][:bucket]}.s3.amazonaws.com",
          IncludeCookies: false,
          Prefix: cloudfront[:log][:prefix]
        },
        Origins: [{
          Id: 'cdo',
          CustomOriginConfig: {
            OriginProtocolPolicy: 'match-viewer'
          },
          DomainName: origin,
          OriginPath: '',

        }],
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
      }.to_json
    end

    # Returns a CloudFront CacheBehavior Hash compatible with the AWS SDK for Ruby v2.
    # Syntax reference: http://docs.aws.amazon.com/sdkforruby/api/Aws/CloudFront/Types/CacheBehavior.html
    # `behavior_config` contains `headers` and `cookies` whitelists.
    def self.cache_behavior(behavior_config, path=nil)
      cookie_config = if behavior_config[:cookies].is_a?(Array)
                        {# required
                          forward: 'whitelist', # required, accepts none, whitelist, all
                          whitelisted_names: {
                            quantity: behavior_config[:cookies].length, # required
                            items: (behavior_config[:cookies].empty? ? nil : behavior_config[:cookies]),
                          }
                        }
                      else
                        {
                          forward: behavior_config[:cookies]
                        }
                      end
      # Always explicitly include Host header in CloudFront's cache key, to match Varnish defaults.
      headers = behavior_config[:headers] + ['Host']
      behavior = {# required
        target_origin_id: 'cdo', # required
        forwarded_values: {# required
          query_string: true, # required
          cookies: cookie_config,
          headers: {
            quantity: headers.length, # required
            items: headers.empty? ? nil : headers,
          },
        },
        trusted_signers: {# required
          enabled: false, # required
          quantity: 0
        },
        viewer_protocol_policy: 'redirect-to-https', # required, accepts allow-all, https-only, redirect-to-https
        min_ttl: 0, # required
        allowed_methods: {
          quantity: 7, # required
          items: ALLOWED_METHODS, # required, accepts GET, HEAD, POST, PUT, PATCH, OPTIONS, DELETE
          cached_methods: {
            quantity: 3, # required
            items: CACHED_METHODS, # required, accepts GET, HEAD, POST, PUT, PATCH, OPTIONS, DELETE
          },
        },
        smooth_streaming: false,
        default_ttl: 0,
        max_ttl: 31_536_000, # =1 year
        compress: false,
      }
      behavior[:path_pattern] = path if path
      behavior
    end

    # Returns a CloudFront CacheBehavior Hash compatible with AWS CloudFormation.
    def self.cache_behavior_cloudformation(behavior_config, path=nil)
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
        Compress: false,
        DefaultTTL: 0,
        ForwardedValues: {
          Cookies: cookie_config,
          # Always explicitly include Host and CloudFront-Forwarded-Proto headers in CloudFront's cache key, to match Varnish defaults.
          Headers: behavior_config[:headers] + %w(Host CloudFront-Forwarded-Proto),
          QueryString: true
        },
        MaxTTL: 31_536_000, # =1 year,
        MinTTL: 0,
        SmoothStreaming: false,
        TargetOriginId: 'cdo',
        TrustedSigners: [],
        ViewerProtocolPolicy: 'redirect-to-https'
      }.tap do |behavior|
        behavior[:PathPattern] = path if path
      end
    end
  end
end
