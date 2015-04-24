require 'cdo/db'
DB = PEGASUS_DB

class Properties

  @@table = DB[:properties]

  def self.get(key)
    i = @@table.where(key:key.to_s).first
    return nil unless i
    JSON.load(StringIO.new(i[:value]))
  end

  def self.set(key, value)
    key = key.to_s

    i = @@table.where(key:key).first
    if i.nil?
      @@table.insert(key:key, value:value.to_json)
    else
      @@table.where(key:key).update(value:value.to_json)
    end

    value
  end

  def self.get_user_metrics()
    self.get(:about_stats)||{
      'number_students'=>5420082,
      'number_teachers'=>124291
    }
  end

end

def fetch_metrics()
  Properties.get(:metrics)||{
    'created_at'=>"2013-12-31T23:59:59+00:00",
    'created_on'=>"2013-12-31",
    'csedweek_organizers'=>0,
    'csedweek_teachers'=>0,
    'csedweek_entire_schools'=>0,
    'csedweek_students'=>0,
    'csedweek_countries'=>0,
    'petition_signatures'=>0,
    'lines_of_code'=>0,
  }
end

def fetch_hoc_metrics()
  metrics = Properties.get(:hoc_metrics)||{
    'started'=>0,
    'finished'=>0,
    'tutorials'=>{'codeorg'=>0},
    'cities'=>{'Seattle'=>0},
    'countries'=>{'United States'=>0},
  }
  metrics['started'] += 409216
  metrics
end

def fetch_user_metrics()
  Properties.get_user_metrics()
end
