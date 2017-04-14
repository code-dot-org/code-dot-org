require 'timeout'
require 'digest/md5'
require 'active_job'
require 'active_support/core_ext/module/attribute_accessors'
require 'active_support/core_ext/numeric/bytes'
require 'active_support/cache'

# Optimizes content on-the-fly based on provided content-type.
# If the process takes longer than specified timeout, the original data will be returned
# and the optimization will finish asynchronously.
module Cdo
  class Optimizer
    MIME_TYPES = %w[
      image/gif
      image/jpeg
      image/png
      image/svg+xml
    ].freeze

    # Since optimization steps can take a long time,
    # cache results in persistent storage to avoid duplicate work.
    # Default to Rails.cache if it's a File or MemCache store.
    # Otherwise, create a new FileStore for local use.
    mattr_accessor :cache do
      rails_cache = (defined?(Rails) && Rails.cache)
      if rails_cache.is_a?(ActiveSupport::Cache::FileStore) ||
        rails_cache.is_a?(ActiveSupport::Cache::MemCacheStore)
        rails_cache
      else
        ActiveSupport::Cache::FileStore.new(dashboard_dir('tmp', 'cache'))
      end
    end

    # Set timeout to non-zero to wait the specified number of seconds for the
    # optimization to finish, before returning nil.
    # Default no timeout.
    mattr_accessor(:timeout) {0}

    # @param data [String] input content
    # @param content_type [String] content type
    # @return [String] optimized content (or nil if optimization is pending)
    def self.optimize(data, content_type)
      Timeout.timeout(timeout) do
        case content_type
          when *MIME_TYPES
            optimize_image(data)
          else
            raise 'Invalid content type'
        end
      end
    rescue Timeout::Error
      # Optimization is still pending after timeout.
      nil
    end

    SLEEP_INTERVAL = 0.1

    # Optimizes image content.
    def self.optimize_image(data)
      cache_key = cache_key(data)
      result = cache.read(cache_key)
      OptimizeJob.perform_later(data) if result.nil?
      raise Timeout::Error if !result && timeout.zero?
      sleep SLEEP_INTERVAL until (result = cache.read(cache_key))
      result
    end

    # Increment OPTIMIZE_VERSION to change the cache key.
    OPTIMIZE_VERSION = 0

    def self.cache_key(data)
      Digest::MD5.new.
        update(data).
        update(OPTIMIZE_VERSION.to_s).
        hexdigest
    end
  end

  # ActiveJob that optimizes an image using ImageOptim, writing the result to cache.
  class OptimizeJob < ActiveJob::Base
    require 'image_optim'
    require 'image_compressor_pack'
    require 'image_size'

    logger.level = Logger::WARN

    IMAGE_OPTIM = ImageOptim.new(
      config_paths: dashboard_dir('config/image_optim.yml'),
      cache_dir: dashboard_dir('tmp/cache/image_optim')
    )

    def perform(data)
      cache = Optimizer.cache
      cache_key = Optimizer.cache_key(data)
      cache.fetch(cache_key) do
        # Write `false` to cache to prevent concurrent image optimizations.
        cache.write(cache_key, false)
        pixels = ImageSize.new(data).size.inject(&:*) rescue 0
        if pixels > 2.megabytes
          data
        else
          IMAGE_OPTIM.optimize_image_data(data) || data
        end
      end
    rescue => e
      # Log error and return original content.
      cache.write(cache_key, data) if cache && cache_key
      logger.fatal "Error: #{e}\n#{CDO.backtrace e}"
      data
    end
  end
end
