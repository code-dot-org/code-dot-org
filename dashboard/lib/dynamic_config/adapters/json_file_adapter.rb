class JSONFileDatastoreAdapter
  def initialize(name)
    @file_path = "#{name}_data.temp_json"
    @hash = {}
    load_from_file()
  end

  def set(key, value)
    @hash[key] = value
    write_to_file()
  end

  def get(key)
    @hash[key]
  end

  def all
    @hash
  end

  def load_from_file
    File.open(@file_path, "w+") do |f|
      begin
        @hash = JSON.load(f.read()) or {}
      rescue
      end
    end
  end

  def write_to_file
    File.open(@file_path, "w") do |f|
      f.write(JSON.dump(@hash))
    end
  end
end
