# A non-persistent datastore adapter that
# can be used with the datastore_cache

require 'oj'
require 'observability/errors'

class MemoryAdapter
  def initialize
    @hash = {}
  end

  def set(key, value)
    @hash[key] = Oj.dump(value, mode: :strict)
  end

  def get(key)
    return nil unless @hash.key?(key)
    Oj.load(@hash[key])
  rescue => exception
    Observability::Errors.report(exception)
    nil
  end

  # Reads are always consistent; the keyword exists to match DynamoDBAdapter#all.
  def all(consistent_read: false)
    ret = {}
    @hash.each_key do |k|
      ret[k] = get(k)
    end
    ret
  end

  def clear
    @hash = {}
  end
end
