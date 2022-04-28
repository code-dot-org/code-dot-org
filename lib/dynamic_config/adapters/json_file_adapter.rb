# A data adapter for datastore_cache that uses a json file as the persistent
# data storage mechanism.

require 'dynamic_config/adapters/base'

class JSONFileDatastoreAdapter < BaseAdapter
  def initialize(file_path)
    @file_path = file_path
    @hash = {}
    load_from_file
  end

  private

  def persist(key, value)
    load_from_file
    @hash[key] = value
    write_to_file
  end

  def all_persisted_keys
    load_from_file
    return @hash.keys
  end

  def retrieve(key)
    load_from_file
    return @hash[key]
  end

  def load_from_file
    begin
      File.open(@file_path, "r") do |f|
        contents = f.read
        @hash = JSON.load(contents)
        @hash = {} if @hash.nil?
      end
    rescue
      @hash = {}
    end
    raise StandardError if @hash.nil?
  end

  def write_to_file
    File.open(@file_path, "w") do |f|
      f.write(JSON.dump(@hash))
    end
  end
end
