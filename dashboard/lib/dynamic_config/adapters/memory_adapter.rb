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
  end

  def all
    ret = {}
    @hash.each do |k, v|
      ret[k] = Oj.load(v)
    end
    ret
  end
end
