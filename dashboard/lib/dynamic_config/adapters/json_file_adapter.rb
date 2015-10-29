# A data adapter for datastore_cache that uses a json file
# as the persistent data storage mechanism.

require 'oj'

class JSONFileDatastoreAdapter
  def initialize(name)
    @file_path = "#{name}_data_temp.json"
    @hash = {}
    load_from_file()
  end

  # @param key [String]
  # @param value [String]
  def set(key, value)
    @hash[key] = Oj.dump(value, :mode => :strict)
    write_to_file()
  end

  # @param key [String]
  # @returns [JSONable Object] or nil if key doesn't exist
  def get(key)
    Oj.load(@hash[key])
  rescue => exc
    Honeybadger.notify(exc)
    nil
  end

  # @returns [Hash]
  def all
    ret = {}
    @hash.each do |k, v|
      begin
        value = Oj.load(v)
      rescue => exc
        Honeybadger.notify(exc)
        nil
      end
      ret[k] = value
    end
    ret
  end

  def load_from_file
    File.open(@file_path, "w+") do |f|
      contents = f.read()
      @hash = JSON.load(contents) || {}
    end
  end

  def write_to_file
    File.open(@file_path, "w") do |f|
      f.write(JSON.dump(@hash))
    end
  end

  def clear
    raise NotImplementedError, "JSONFileDatastoreAdapter does not support clear"
  end
end
