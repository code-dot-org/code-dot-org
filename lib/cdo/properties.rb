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

  def self.get_user_metrics()
    self.get(:about_stats) || {
      # The percentage of users with user_type = 'student' and last_sign_in_at != null and
      # gender != null that have gender = 'f' (circa Oct 2015).
      'percent_female'=>42,
      'number_served'=>119410701,
      # The number of users with user_type = 'student' and last_sign_in_at != null (circa Oct 2015).
      'number_students'=>5035892,
      # The number of users with user_type = 'teacher' and last_sign_in_at != null (circa Oct 2015).
      'number_teachers'=>178289
    }
  end

end

def fetch_metrics()
  Properties.get(:metrics) || {
  {
    'created_at'=>"2016-01-04T21:37:19+00:00",
    'created_on'=>"2016-01-04",
    'csedweek_organizers'=>38236,
    'csedweek_teachers'=>24025,
    'csedweek_entire_schools'=>12754,
    'csedweek_students'=>4875091,
    'csedweek_countries'=>356,
    'petition_signatures'=>2053571,
    'lines_of_code'=>11151730618,
  }
end

def fetch_hoc_metrics()
  # Include stale default values as of 2015-11-04 so we never show 0.
  metrics = Properties.get(:hoc_metrics) || {
    'started'=>136340020,
    'finished'=>23600234,
    'tutorials'=>{
      'codeorg'=>30269786,
      'tynker'=>27389293,
      'frozen'=>13924711,
      'flappy'=>11551220,
      'hourofcode'=>8398186,
      'codecombat'=>5117384,
      'lightbot'=>4754226,
      'tynkerapp'=>4155265,
      'khan'=>3656629,
      'scratch'=>3585379,
      'playlab'=>2943026,
      'makegameswithus'=>1905887,
      'touchdevelop'=>1385722,
      'codecademy'=>1224969,
      },
    'cities'=>{
      "Seattle"=>3041726,
      "Woodbridge"=>1929529,
      "San Jose"=>1069716,
      "Columbia"=>740828,
      "Los Angeles"=>665964,
      "Raleigh"=>648910,
      "Houston"=>637847,
      "Chicago"=>629701,
      },
    'countries'=>{
      "United States"=>84295301,
      "United Kingdom"=>8198056,
      "Canada"=>2460307,
      "Australia"=>1485507,
      "Ireland"=>1276825,
      "Brazil"=>1231030,
      "Turkey"=>1204962,
      "India"=>1162559,
      "Mexico"=>967736,
      },
    'total_hoc_count'=>71132,
    'hoc_country_totals'=>{},
    'hoc_company_totals'=>{},
  }
  # Increase the 'started' metric by 409K to reflect participant count from surveys, circa
  # February 2014.
  metrics['started'] += 409216

  # temporarily hard-code number served while analyze_hoc_activity is busted
  metrics['started'] = 189782984
  metrics
end

def fetch_user_metrics()
  Properties.get_user_metrics()
end
