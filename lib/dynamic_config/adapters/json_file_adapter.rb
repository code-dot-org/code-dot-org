# A data adapter for datastore_cache that uses a json file
# as the persistent data storage mechanism.

require 'oj'

class JSONFileDatastoreAdapter
  def initialize(file_path)
    @file_path = file_path
    @hash = {}
    load_from_file
  end

  # @param key [String]
  # @param value [String]
  def set(key, value)
    load_from_file
    @hash[key] = Oj.dump(value, mode: :strict)
    write_to_file
  end

  # @param key [String]
  # @returns [JSONable Object] or nil if key doesn't exist
  def get(key)
    load_from_file
    return nil unless @hash.key?(key)
    begin
      return Oj.load(@hash[key])
    rescue => exception
      Harness.error_notify(exception)
    end
    nil
  end

  # @returns [Hash]
  def all
    load_from_file
    ret = {}
    @hash.each do |k, v|
      begin
        value = Oj.load(v)
      rescue => exception
        Harness.error_notify(exception)
        nil
      end
      ret[k] = value
    end
    ret
  end

  def load_from_file
    begin
      File.open(@file_path, "r") do |f|
        contents = f.read
        @hash = JSON.parse(contents)
        @hash = {} if @hash.nil?
      end
    rescue
      @hash = {}
    end
    raise StandardError if @hash.nil?
  end

  def write_to_file
    File.write(@file_path, JSON.dump(@hash))
  end

  def clear
    raise NotImplementedError, "JSONFileDatastoreAdapter does not support clear"
  end
end
