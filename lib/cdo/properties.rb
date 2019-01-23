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
    JSON.load(StringIO.new(i[:value]))
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
      'percent_female' => 44,
      'number_served' => 426_346_094,
      'number_students' => 19_177_297,
      'number_teachers' => 591_636
    }
  end
end

def fetch_metrics
  # Include stale default values as of 2017-06-21 (project count from 2019-1-20) so we never show 0. These
  # would be used, for example, if the DB is unavailable.
  Properties.get(:metrics) || {
    'created_at' => '2017-06-21T14:46:25+00:00',
    'created_on' => 'created_on"=>"2017-06-21',
    'petition_signatures' => 1_774_817,
    'lines_of_code' => 21_238_497_830,
    'project_count' => 35_000_000
  }
end

# Puts project count into format of XX million for display
def round_project_count_to_million(project_count)
  project_count = (project_count / 1_000_000).floor
  return project_count
end

def fetch_hoc_metrics
  # Include stale default values as of 2017-06-21 so we never show 0. These
  # would be used, for example, if the DB is unavailable or the cron failed to
  # run properly.
  Properties.get(:hoc_metrics) || {
    'started' => 426_370_561,
    'finished' => 56_214_858,
    # Generated by `fetch_hoc_metrics['cities'].first(40).to_h`. Note that we
    # take the top forty, as that many cities are shown on the leaderboard.
    'cities' => {
      'Other' => 64_947_807,
      'Boardman' => 18_257_407,
      'Seattle' => 13_578_324,
      'London' => 5_370_611,
      'Columbia' => 3_047_152,
      'Woodbridge' => 3_014_896,
      'Los Angeles' => 2_663_739,
      'Houston' => 2_092_703,
      'Springfield' => 1_885_386,
      'San Jose' => 1_777_312,
      'Taipei' => 1_715_111,
      'Durham' => 1_652_806,
      'Brooklyn' => 1_601_797,
      'San Diego' => 1_526_723,
      'Chicago' => 1_487_786,
      'Las Vegas' => 1_387_025,
      'San Antonio' => 1_265_114,
      'Lincoln' => 1_222_483,
      'Seoul' => 1_195_600,
      'Raleigh' => 1_167_957,
      'Athens' => 1_156_889,
      'Melbourne' => 1_119_202,
      'Istanbul' => 1_119_121,
      'Tallahassee' => 1_094_189,
      'Salt Lake City' => 1_076_532,
      'Philadelphia' => 1_056_909,
      'Minneapolis' => 1_022_761,
      'Long Beach' => 1_022_713,
      'Denver' => 1_002_242,
      'Indianapolis' => 966_475,
      'Austin' => 965_806,
      'Ashburn' => 934_234,
      'Toronto' => 923_240,
      'Phoenix' => 884_808,
      'Fort Lauderdale' => 881_496,
      'Little Rock' => 852_924,
      'Nashville' => 836_503,
      'Aurora' => 825_056,
      'Birmingham' => 815_304,
      'Madison' => 814_780,
    },
    # Generated by `fetch_hoc_metrics['countries'].first(40).to_h`. Note that we
    # take the top forty, as that many countries are shown on the leaderboard.
    'countries' => {
      'United States' => 269_119_961,
      'United Kingdom' => 23_640_611,
      'Other' => 10_759_918,
      'Canada' => 9_938_588,
      'Australia' => 7_795_086,
      'Turkey' => 5_320_296,
      'France' => 5_066_582,
      'Italy' => 4_849_916,
      'Taiwan' => 3_824_526,
      'Spain' => 3_568_500,
      'Poland' => 3_386_767,
      'Brazil' => 3_125_785,
      'Mexico' => 2_478_498,
      'India' => 2_317_183,
      'China' => 2_065_029,
      'Republic of Korea' => 2_021_896,
      'Korea, Republic of' => 1_883_003,
      'Ireland' => 1_786_424,
      'Greece' => 1_736_384,
      'Japan' => 1_703_289,
      'Romania' => 1_678_404,
      'Colombia' => 1_587_535,
      'Israel' => 1_441_735,
      'Netherlands' => 1_438_695,
      'Finland' => 1_417_359,
      'New Zealand' => 1_397_405,
      'Sweden' => 1_390_016,
      'Germany' => 1_386_411,
      'Ukraine' => 1_288_207,
      'United Arab Emirates' => 1_282_278,
      'Vietnam' => 1_180_923,
      'Russian Federation' => 908_395,
      'Norway' => 819_309,
      'Argentina' => 801_222,
      'Denmark' => 801_015,
      'Thailand' => 765_155,
      'Portugal' => 694_856,
      'Malaysia' => 664_502,
      'Egypt' => 657_018,
      'Belgium' => 644_326
    },
    # The count was reset to 0 in June 2017 as the result of moving to HOC2017
    # from HOC2016.
    'total_hoc_count' => 0,
    'total_codedotorg_count' => 215_833_097,
    'hoc_country_totals' => {},
    'hoc_company_totals' => {}
  }
end

def fetch_user_metrics
  Properties.get_user_metrics
end
