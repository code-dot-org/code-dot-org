require 'cdo/db'
require 'cdo/cache'
DB = PEGASUS_DB

# A wrapper class around the PEGASUS_DB[:properties] table.
class Properties
  @@table = DB[:properties]

  # @param key [String] the key to retrieve the value of.
  # @return [JSON] the value associated with key, nil if key does not exist.
  def self.get(key)
    i = CDO.cache.fetch("properties/#{key}", expires_in: 60) do
      @@table.where(key: key.to_s).first
    end
    return nil unless i
    JSON.parse(i[:value])
  end

  # @param key [String] the key to insert
  # @param value [String] the string to insert as JSON
  # @return [String] the value parameter
  def self.set(key, value)
    key = key.to_s
    CDO.cache.delete("properties/#{key}")

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
    CDO.cache.delete("properties/#{key}")
    @@table.where(key: key).delete
  end

  def self.get_user_metrics
    # Include stale default values as of 2017-06-21 so we never show 0. These
    # would be used, for example, if the DB is unavailable or the cron failed to
    # run properly.
    get(:about_stats) || {
      'number_students' => 19_177_297,
      'number_teachers' => 591_636
    }
  end
end

def fetch_metrics
  # Include stale default values as of 2017-06-21 (project count from 2019-1-20) so we never show 0.
  # Note that project_count might be nil due to analyze_hoc_activity, and so we delete nil values prior to the merge,
  # so that the merge doesn't overwrite our human-readable defaults with nil.
  {
    'created_at' => '2017-06-21T14:46:25+00:00',
    'created_on' => 'created_on"=>"2017-06-21',
    'petition_signatures' => 1_774_817,
    'lines_of_code' => 21_238_497_830,
    'project_count' => 35_000_000
  }.merge((Properties.get(:metrics) || {}).delete_if {|_, v| v.nil? || v == 0})
end

def fetch_project_count
  current_project_count = fetch_metrics['project_count']
  {
    'total_projects' => current_project_count,
    'rounded_down_millions' => (current_project_count / 1_000_000).floor
  }
end

def fetch_hoc_metrics
  # Include stale default values as of 2017-06-21 so we never show 0. These
  # would be used, for example, if the DB is unavailable or the cron failed to
  # run properly.
  Properties.get(:hoc_metrics) || {
    'started' => 426_370_561,
    'finished' => 56_214_858,
    # The count was reset to 0 in June 2017 as the result of moving to HOC2017
    # from HOC2016.
    'total_hoc_count' => 0,
    'total_codedotorg_count' => 215_833_097,
  }
end

def fetch_user_metrics
  Properties.get_user_metrics
end
