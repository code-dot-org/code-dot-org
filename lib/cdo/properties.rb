require 'cdo/db'
DB = PEGASUS_DB

# A wrapper class around the PEGASUS_DB[:properties] table.
class Properties
  @@table = DB[:properties]

  # @param key [String] the key to retrieve the value of.
  # @return [JSON] the value associated with key, nil if key does not exist.
  def self.get(key)
    i = @@table.where(key: key.to_s).first
    return nil unless i
    JSON.load(StringIO.new(i[:value]))
  end

  # @param key [String] the key to insert
  # @param value [String] the string to insert as JSON
  # @return [String] the value parameter
  def self.set(key, value)
    key = key.to_s

    i = @@table.where(key: key).first
    if i.nil?
      @@table.insert(key: key, value: value.to_json)
    else
      @@table.where(key: key).update(value: value.to_json)
    end

    value
  end

  # @param key [String] the key to delete.
  # @return [Integer] the number of rows deleted.
  def self.delete(key)
    @@table.where(key: key).delete
  end

  def self.get_user_metrics
    get :about_stats
  end
end

def fetch_metrics
  Properties.get(:metrics)
end

def fetch_hoc_metrics
  Properties.get(:hoc_metrics)
end

def fetch_user_metrics
  Properties.get_user_metrics
end
