require 'cdo/db'
require 'cdo/geocoder'
require 'cdo/properties'
require 'json'
require 'securerandom'

class Tutorials
  def initialize(table)
    @table = table
    @contents = DB[@table].all
  end

  # Returns an array of the tutorials.  Includes launch_url for each.
  def contents(host_with_port)
    @contents.each do |tutorial|
      tutorial[:launch_url] = launch_url_for(tutorial[:code], host_with_port)
    end
  end

  def launch_url_for(code, domain)
    return @contents.find {|row| row[:code] == code}[:url] if @table == :beyond_tutorials

    api_domain = domain.gsub('csedweek.org', 'code.org')
    api_domain = api_domain.gsub('hourofcode.com', 'code.org')
    api_domain = api_domain.gsub('ar.code.org', 'code.org')
    api_domain = api_domain.gsub('br.code.org', 'code.org')
    api_domain = api_domain.gsub('ro.code.org', 'code.org')
    api_domain = api_domain.gsub('sg.code.org', 'code.org')
    api_domain = api_domain.gsub('tr.code.org', 'code.org')
    api_domain = api_domain.gsub('uk.code.org', 'code.org')
    api_domain = api_domain.gsub('za.code.org', 'code.org')
    "http://#{api_domain}/api/hour/begin_learn/#{code}"
  end

  def find_with_tag(tag)
    results = {}
    @contents.each do |i|
      tags = CSV.parse_line(i[:tags].to_s)
      next unless tags.include?(tag)
      results[i[:code]] = i
    end
    results
  end

  def find_with_tag_and_language(tag, language)
    results = {}
    @contents.each do |i|
      tags = CSV.parse_line(i[:tags].to_s)
      next unless tags.include?(tag)

      languages = CSV.parse_line(i[:languages_supported].to_s)
      next unless languages.nil_or_empty? || languages.include?(language) || languages.include?(language[0, 2])

      results[i[:code]] = i
    end
    results
  end
end

def no_credit_count
  DB[:cdo_state_promote].where(cs_counts_t: 'No').count
end

def credit_count
  DB[:cdo_state_promote].where("cs_counts_t = 'Yes' || cs_counts_t = 'Other'").count
end

def jobs_nationwide
  DB[:cdo_state_promote].where(state_code_s: "Sum_states").first[:cs_jobs_i]
end

def grads_nationwide
  DB[:cdo_state_promote].where(state_code_s: "Sum_states").first[:cs_graduates_i]
end

def zip_code_from_code(code)
  DB[:geography_us_zip_codes].where(code_s: code.to_s.strip).first
end

def zip_code?(code)
  !zip_code_from_code(code).nil?
end

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

class Form2 < OpenStruct
  def initialize(params={})
    params = params.dup
    params[:data] = JSON.load(params[:data])
    params[:processed_data] = JSON.load(params[:processed_data])
    super params
  end

  def self.from_row(row)
    return nil unless row
    new row
  end
end
