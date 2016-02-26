# A non-persistent datastore adapter that
# can be used with the datastore_cache

require 'oj'

class MemoryAdapter
  def initialize
    @hash = {}
  end

  def set(key, value)
    @hash[key] = Oj.dump(value, :mode => :strict)
  end

  def get(key)
    Oj.load(@hash[key])
  rescue => exc
    Honeybadger.notify(exc)
    nil
  end

  def all
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
