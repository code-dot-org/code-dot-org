require 'cdo/db'
require 'cdo/geocoder'
require 'cdo/properties'
require 'cdo/form'
require 'securerandom'
require 'active_support/core_ext/enumerable'
require 'active_support/core_ext/object/deep_dup'

class Tutorials
  # This class uses data from two GSheets:
  #   GoogleDrive://Pegasus/v3/cdo-tutorials
  #   GoogleDrive://Pegasus/v3/cdo-beyond-tutorials
  # These sheets are in the "v3" Google Sheet format and use datatype suffixes on the column names,
  # and map to tables in the database to match the v3 convention:
  #   cdo_tutorials
  #   cdo_beyond_tutorials
  # We alias the database columns with names that have the datatype suffixes stripped off for
  # backwards-compatibility with some existing tutorial pages
  # Note: A tutorial can be present in the sheet but hidden by giving it the "do-not-show" tag.
  def initialize(table)
    @table = "cdo_#{table}".to_sym
    # create an alias for each column without the datatype suffix (alias "amidala_jarjar_s" as "amidala_jarjar")
    @column_aliases = CDO.cache.fetch("Tutorials/#{@table}/column_aliases") do
      DB.schema(@table).map do |column|
        db_column_name = column[0].to_s
        column_alias = db_column_name.rindex('_').nil? ? db_column_name : db_column_name.rpartition('_')[0]
        "#{db_column_name}___#{column_alias}".to_sym
      end
    end
    @contents = CDO.cache.fetch("Tutorials/#{@table}/contents") do
      DB[@table].select(*@column_aliases).all
    end.deep_dup
  end

  # Returns an array of the tutorials.  Includes launch_url for each.
  def contents(host_with_port)
    @contents.each do |tutorial|
      tutorial[:launch_url] = launch_url_for(tutorial[:code], host_with_port)
    end
  end

  def launch_url_for(code, domain)
    return @contents.find {|row| row[:code] == code}[:url] if @table == :cdo_beyond_tutorials

    api_domain = domain.gsub('csedweek.org', 'code.org')
    api_domain = api_domain.gsub('hourofcode.com', 'code.org')
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

  # return the first tutorial with a matching code
  def find_with_code(code)
    by_code = CDO.cache.fetch("Tutorials/#{@table}/by_code") {@contents.index_by {|row| row[:code]}}
    by_code[code]
  end

  # return the first tutorial with a matching short code
  def find_with_short_code(short_code)
    by_short_code = CDO.cache.fetch("Tutorials/#{@table}/by_short_code") {@contents.index_by {|row| row[:short_code]}}
    by_short_code[short_code]
  end

  def self.sort_by_popularity?(site, hoc_mode)
    ("post-hoc" == hoc_mode) || (site == 'code.org' && [false, 'pre-hoc'].include?(hoc_mode))
  end
end

def no_credit_count
  DB[:cdo_state_promote].where(cs_counts_t: 'No').count
end

def credit_count
  DB[:cdo_state_promote].where("cs_counts_t = 'Yes' || cs_counts_t = 'Other'").count
end

def hs_access_count
  DB[:cdo_state_promote].where(require_hs_s: 'Yes').count
end

def k12_access_count
  DB[:cdo_state_promote].where(require_k12_s: 'Yes').count
end

def jobs_nationwide
  $jobs_nationwide ||= DB[:cdo_state_promote].sum(:cs_jobs_i)
end

def grads_nationwide
  $grads_nationwide ||= DB[:cdo_state_promote].sum(:cs_graduates_i)
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
