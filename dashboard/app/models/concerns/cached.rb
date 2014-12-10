# Utility methods for caching models in a local class variable.
# Rather than depending on a distributed cache, a local memory object cache is
# more suitable for small, static objects.
module Cached
  extend ActiveSupport::Concern
  included do
    class_variable_set('@@local_cache', {})
    cattr_reader :local_cache
  end

  def cached(name)
    local_cache["#{cache_key}/#{name}"] ||= [1].map do
      yield
    end.first
  end

  module ClassMethods
    def cached(name)
      local_cache["#{self.class}/#{name}"] ||= [1].map do
        yield
      end.first
    end
  end
end

