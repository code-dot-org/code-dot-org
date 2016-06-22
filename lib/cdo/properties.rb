require 'cdo/db'
DB = PEGASUS_DB

class Properties

  @@table = DB[:properties]

  def self.get(key)
    i = @@table.where(key: key.to_s).first
    return nil unless i
    JSON.load(StringIO.new(i[:value]))
  end

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

  def self.get_user_metrics
    self.get(:about_stats) || {
      # The percentage of users with user_type = 'student' and last_sign_in_at != null and
      # gender != null that have gender = 'f' (circa Oct 2015).
      'percent_female'=>42,
      'number_served'=>119_410_701,
      # The number of users with user_type = 'student' and last_sign_in_at != null (circa Oct 2015).
      'number_students'=>5_035_892,
      # The number of users with user_type = 'teacher' and last_sign_in_at != null (circa Oct 2015).
      'number_teachers'=>178289
    }
  end

end

def fetch_metrics
  # Include stale default values as of 2016-01-04 so we never show 0. These
  # would be used, for example, if the DB is unavailable.
  Properties.get(:metrics) || {
    'created_at'=>"2016-01-04T21:37:19+00:00",
    'created_on'=>"2016-01-04",
    'csedweek_organizers'=>38236,
    'csedweek_teachers'=>24025,
    'csedweek_entire_schools'=>12754,
    'csedweek_students'=>4_875_091,
    'csedweek_countries'=>356,
    'petition_signatures'=>2_053_571,
    'lines_of_code'=>11_151_730_618,
  }
end

def fetch_hoc_metrics
  # Include stale default values as of 2015-11-04 so we never show 0. These
  # would be used, for example, if the DB is unavailable.
  metrics = Properties.get(:hoc_metrics) || {
    'started'=>151_610_563,
    'finished'=>23_600_234,
    'tutorials'=>{
      'codeorg'=>30_269_786,
      'tynker'=>27_389_293,
      'frozen'=>13_924_711,
      'flappy'=>11_551_220,
      'hourofcode'=>8_398_186,
      'codecombat'=>5_117_384,
      'lightbot'=>4_754_226,
      'tynkerapp'=>4_155_265,
      'khan'=>3_656_629,
      'scratch'=>3_585_379,
      'playlab'=>2_943_026,
      'makegameswithus'=>1_905_887,
      'touchdevelop'=>1_385_722,
      'codecademy'=>1_224_969,
      },
    'cities'=>{
      "Seattle"=>3_041_726,
      "Woodbridge"=>1_929_529,
      "San Jose"=>1_069_716,
      "Columbia"=>740828,
      "Los Angeles"=>665964,
      "Raleigh"=>648910,
      "Houston"=>637847,
      "Chicago"=>629701,
      },
    'countries'=>{
      "United States"=>84_295_301,
      "United Kingdom"=>8_198_056,
      "Canada"=>2_460_307,
      "Australia"=>1_485_507,
      "Ireland"=>1_276_825,
      "Brazil"=>1_231_030,
      "Turkey"=>1_204_962,
      "India"=>1_162_559,
      "Mexico"=>967736,
      },
    'total_hoc_count'=>71132,
    # The value as of 2016-01-15.
    'total_codedotorg_count'=>106_844_676,
    'hoc_country_totals'=>{},
    'hoc_company_totals'=>{},
  }

  metrics
end

def fetch_user_metrics
  Properties.get_user_metrics()
end
