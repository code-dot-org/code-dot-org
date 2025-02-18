class CacheClient
  def initialize(namespace)
    raise ArgumentError unless namespace
    @namespace = namespace
  end

  def write(key, value, expires_in = 1.minute)
    CDO.shared_cache.write("#{@namespace}/#{key}", value.to_json, expires_in: expires_in)
  end

  def read(key)
    json_value = CDO.shared_cache.read("#{@namespace}/#{key}")
    return nil unless json_value
    JSON.parse(json_value).symbolize_keys
  end
end
