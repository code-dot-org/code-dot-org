require_relative '../../../deployment'
require 'digest'
require 'aws-sdk'
require_relative '../../../cookbooks/cdo-varnish/libraries/http_cache'
require_relative '../../../cookbooks/cdo-varnish/libraries/helpers'

# Manages application-specific configuration and deployment of AWS CloudFront distributions.
module AWS
  class CloudFront
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

    # Creates or updates the CloudFront distribution based on the current configuration.
    # Calls to this method should be idempotent, however CloudFront distribution updates can take ~15 minutes to finish.
    #
    # Ref: http://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/HowToUpdateDistribution.html
    # "Your changes don't propagate to every edge location instantaneously; propagation to all edge locations can take
    #  15 minutes. When propagation is complete, the status of your distribution changes from InProgress to Deployed.
    #  While CloudFront is propagating your changes to edge locations, we cannot determine whether a given edge
    #  location is serving your content based on the previous configuration or the new configuration."
    def self.create_or_update
      cloudfront = Aws::CloudFront::Client.new
      ids = CONFIG.keys.map do |app|
        distribution = cloudfront.list_distributions.distribution_list.items.detect do |i|
          i.aliases.items.include?(CDO.method("#{app}_hostname").call)
        end
        if distribution
          id = distribution.id
          distribution_config = cloudfront.get_distribution_config(id: id)
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

    # Returns a CloudFront DistributionConfig Hash compatible with the AWS SDK for Ruby v2.
    # Syntax reference: http://docs.aws.amazon.com/sdkforruby/api/Aws/CloudFront/Types/DistributionConfig.html
    # `app` is a symbol containing the app name (:pegasus, :dashboard or :hourofcode)
    def self.config(app, reference = nil)
      config = app == :hourofcode ? HTTP_CACHE[:pegasus] : HTTP_CACHE[app]
      cloudfront = CONFIG[app]
      behaviors = config[:behaviors].map do |behavior|
        paths = behavior[:path]
        paths = [paths] unless paths.is_a? Array
        validate_paths paths
        paths.map do |path|
          cache_behavior behavior, path
        end
      end.flatten

      ssl_cert = cloudfront[:ssl_cert]
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
              },
            },
          ],
        },
        default_cache_behavior: cache_behavior(config[:default]),
        cache_behaviors: {
          quantity: behaviors.length, # required
          items: behaviors.empty? ? nil : behaviors,
        },
        custom_error_responses: {}.tap do |hash|
          # List from: http://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/HTTPStatusCodes.html#HTTPStatusCodes-cached-errors
          error_codes = [400, 403, 404, 405, 414, 500, 501, 502, 503, 504]
          hash[:items] = error_codes.map do |error|
            {
              error_code: error,
              response_code: '',
              response_page_path: '',
              error_caching_min_ttl: 0
            }
          end
          hash[:quantity] = error_codes.length
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
          # Lookup IAM Certificate ID from server certificate name
          iam_certificate_id: Aws::IAM::Client.new.
            get_server_certificate(server_certificate_name: ssl_cert).
            server_certificate.server_certificate_metadata.server_certificate_id,
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
      }.tap do |cf|
        cf[:caller_reference] = reference || Digest::MD5.hexdigest(Marshal.dump(config)) # required
      end
    end

    # Returns a CloudFront CacheBehavior Hash compatible with the AWS SDK for Ruby v2.
    # Syntax reference: http://docs.aws.amazon.com/sdkforruby/api/Aws/CloudFront/Types/CacheBehavior.html
    # `behavior_config` contains `headers` and `cookies` whitelists.
    def self.cache_behavior(behavior_config, path=nil)
      # Always explicitly include Host header in CloudFront's cache key, to match Varnish defaults.
      headers = behavior_config[:headers] + ['Host']
      behavior = {# required
        target_origin_id: 'cdo', # required
        forwarded_values: {# required
          query_string: true, # required
          cookies:
            if behavior_config[:cookies].is_a?(Array)
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
            end,
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
          items: %w(HEAD DELETE POST GET OPTIONS PUT PATCH), # required, accepts GET, HEAD, POST, PUT, PATCH, OPTIONS, DELETE
          cached_methods: {
            quantity: 3, # required
            items: %w(HEAD GET OPTIONS), # required, accepts GET, HEAD, POST, PUT, PATCH, OPTIONS, DELETE
          },
        },
        smooth_streaming: false,
        default_ttl: 0,
        max_ttl: 31536000, # =1 year
      }
      behavior[:path_pattern] = path if path
      behavior
    end
  end
end
