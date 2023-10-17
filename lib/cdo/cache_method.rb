require 'active_support/cache'
require 'active_support/notifications'
require 'active_support/core_ext/module/attribute_accessors'
require 'active_support/core_ext/hash/reverse_merge'
require 'cdo/cache'

# CacheMethod module refinement.
# Memoizes a function to the provided cache store, including passed arguments.
#
# @example
# class MyClass
#   using CacheMethod
#   cached def echo(x)
#     puts "Processing #{x}..."
#     x
#   end
# end
#
# > MyClass.new.echo 'foo'
# Processing foo...
# => "foo"
# > MyClass.new.echo 'foo'
# => "foo"
# > MyClass.new.echo 'bar'
# Processing bar...
# => "bar"
#
module CacheMethod
  DEFAULT_CACHE_OPTIONS = {
    cache: CDO.cache
  }.freeze

  mattr_accessor(:cache_options) {Hash.new({})}

  refine Module do
    def cache_options
      CacheMethod.cache_options[self]
    end

    def cache_options=(options)
      CacheMethod.cache_options[self] = options
    end

    def cached(method_id, options = cache_options)
      options.reverse_merge! DEFAULT_CACHE_OPTIONS
      cache = options.delete(:cache)
      version = options.delete(:version)
      original_method_id = "_cache_method_#{method_id}"

      # Support instance methods and singleton-class methods.
      base = (instance_methods.include?(method_id)) ? self : singleton_class
      base.send(:alias_method, original_method_id, method_id)
      base.send(:define_method, method_id) do |*args, **kwargs, &blk|
        cache_key = ActiveSupport::Cache.expand_cache_key([method(method_id).inspect, args], version)
        cache.fetch(cache_key, options) do
          send(original_method_id, *args, **kwargs, &blk)
        end
      end
    end
  end
end
