# A non-persistent datastore adapter that can be used with the datastore_cache

require 'dynamic_config/adapters/base'

class MemoryAdapter < BaseAdapter
  def initialize
    @hash = {}
  end

  def clear
    @hash = {}
  end

  private

  def persist(key, value)
    @hash[key] = value
  end

  def all_persisted_keys
    @hash.keys
  end

  def retrieve(key)
    @hash[key]
  end
end
