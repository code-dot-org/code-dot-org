require 'cdo/db'
DB = PEGASUS_DB

class Properties

  def initialize()
    @table = DB[:properties]
  end

  def get(key)
    i = @table.where(key:key.to_s).first
    return nil unless i
    JSON.load(StringIO.new(i[:value]))
  end

  def set(key, value)
    key = key.to_s

    i = @table.where(key:key).first
    if i.nil?
      @table.insert(key:key, value:value.to_json)
    else
      @table.where(key:key).update(value:value.to_json)
    end

    value
  end

end
PROPERTIES = Properties.new

class Tutorials

  def initialize(table)
    @table = table
  end

  def launch_url_for(code,domain)
    return DB[:beyond_tutorials].where(code:code).first[:url] if @table == :beyond_tutorials

    api_domain = domain.gsub('csedweek.org','code.org')
    api_domain = api_domain.gsub('al.code.org','code.org')
    api_domain = api_domain.gsub('ar.code.org','code.org')
    api_domain = api_domain.gsub('br.code.org','code.org')
    api_domain = api_domain.gsub('eu.code.org','code.org')
    api_domain = api_domain.gsub('ro.code.org','code.org')
    api_domain = api_domain.gsub('uk.code.org','code.org')
    "http://#{api_domain}/api/hour/begin/#{code}"
  end

  def find_with_tag(tag)
    results = {}
    DB[@table].all.each do |i|
      tags = CSV.parse_line(i[:tags].to_s)
      next unless tags.include?(tag)
      results[i[:code]] = i
    end
    results
  end

  def find_with_tag_and_language(tag, language)
    results = {}
    DB[@table].all.each do |i|
      tags = CSV.parse_line(i[:tags].to_s)
      next unless tags.include?(tag)

      languages = CSV.parse_line(i[:languages_supported].to_s)
      next unless languages.nil_or_empty? || languages.include?(language) || languages.include?(language[0,2])

      results[i[:code]] = i
    end
    results
  end
end

def event_whitelisted?(name, type)
  DB[:cdo_events_whitelist].where(organization_name_s:name.to_s.strip).and(event_type_s:type).count == 0
end

def country_from_code(code)
  DB[:geography_countries].where(code_s:code.to_s.strip.upcase).first
end
def country_name_from_code(code)
  country = country_from_code(code)
  return code unless country
  country[:name_s]
end
def no_credit_count
    DB[:cdo_state_promote].where(cs_counts_t:'No').exclude(state_code_s:'DC').count
end
def us_state_from_code(code)
  DB[:geography_us_states].where(code_s:code.to_s.strip.upcase).first
end
def us_state_code?(code)
  !us_state_from_code(code).nil?
end
def us_state_name_from_code(code)
  state = us_state_from_code(code)
  return code unless state
  state[:name_s]
end

def zip_code_from_code(code)
  DB[:geography_us_zip_codes].where(code_s:code.to_s.strip).first
end
def zip_code?(code)
  !zip_code_from_code(code).nil?
end

def fetch_metrics()
  metrics = PROPERTIES.get(:metrics)||{
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
  metrics
end

def fetch_hoc_metrics()
  metrics = PROPERTIES.get(:hoc_metrics)||{
    'started'=>0,
    'finished'=>0,
    'tutorials'=>{'codeorg'=>0},
    'cities'=>{'Seattle'=>0},
    'countries'=>{'United States'=>0},
  }
  metrics['started'] += 409216
  metrics
end

require 'cdo/geocoder'

def search_for_address(address)
  sleep(0.01)
  Geocoder.search(address).first
end

def geocode_address(address)
  location = search_for_address(address)
  return nil unless location
  return nil unless location.latitude && location.longitude
  "#{location.latitude},#{location.longitude}"
end

def geocode_ip_address(ip_address)
  geocode_address(ip_address)
end

def geocode_zip_code(code)
  zip_code = zip_code_from_code(code)
  return nil unless zip_code
  return nil unless zip_code[:latitude_f] && zip_code[:longitude_f]
  "#{zip_code[:latitude_f]},#{zip_code[:longitude_f]}"
end


require 'data_mapper'
require 'dm-migrations'
require 'dm-timestamps'
require 'dm-transactions'
require 'dm-types'
require 'dm-validations'
require 'securerandom'
require 'json'

DataMapper.setup(:default, CDO.pegasus_db_writer)
require src_dir 'database/validation_error'
require src_dir 'database/hour_of_activity'
require src_dir 'database/district_partner'
require src_dir 'database/form'
require src_dir 'poste/database'
DataMapper.finalize
DataMapper.auto_upgrade! unless CDO.read_only
