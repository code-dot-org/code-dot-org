require 'cdo/db'
require 'cdo/geocoder'
require 'cdo/properties'
require 'json'
require 'securerandom'

class Tutorials
  # The Tutorials pages used to source data from the tutorials and beyond_tutorials tables, which were imported from
  # the GoogleDrive://Pegasus/Data/ HocTutorials and HocBeyondTutorials Google Sheets
  # Those sheets have been ported to the "v3" Google Sheet format in the GoogleDrive://Pegasus/v3 folder
  # and use datatype suffixes on the column names and have new table names to match the v3 convention:
  #      cdo_tutorials and cdo_beyond_tutorials
  # Prefix "cdo_" on the table name to use the new tables sourced from the new v3 Google Sheets
  # and alias the database columns with names that have the datatype suffixes stripped off so that existing
  # tutorial pages do not need to be modified to reference the new column names
  def initialize(table)
    @table = "cdo_#{table}".to_sym
    # create an alias for each column without the datatype suffix (alias "amidala_jarjar_s" as "amidala_jarjar")
    @column_aliases = DB.schema(@table).map do |column|
      db_column_name = column[0].to_s
      column_alias = db_column_name.rindex('_').nil? ? db_column_name : db_column_name.rpartition('_')[0]
      "#{db_column_name}___#{column_alias}".to_sym
    end
    @contents = DB[@table].select(*@column_aliases).all
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

  # return the first tutorial with a matching code
  def find_with_code(code)
    # We have to use the new column name (which has datatype suffix) in where clause
    # while aliasing the columns in the result set to match the old naming convention (no datatype suffix).
    DB[@table].select(*@column_aliases).where(code_s: code).first
  end

  # return the first tutorial with a matching short code
  def find_with_short_code(short_code)
    # We have to use the new column name (which has datatype suffix) in where clause
    # while aliasing the columns in the result set to match the old naming convention (no datatype suffix).
    DB[@table].select(*@column_aliases).where(short_code_s: short_code).first
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
