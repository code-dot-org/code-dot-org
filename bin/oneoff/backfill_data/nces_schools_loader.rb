#!/usr/bin/env ruby

require_relative '../../../dashboard/config/environment'
require 'aws-sdk'
require 'singleton'
require 'tempfile'

# NCES Schools Data Loader
class NcesSchoolsLoader
  attr_reader :s3_key, :csv_options

  def initialize(s3_key, csv_options)
    @s3_key = s3_key.freeze
    @csv_options = csv_options.freeze
  end

  # Loads the NCES datafile and merges the resutls into the current dataset.
  # @param merge [Boolean] true if merging the datasets, false otherwise
  def load(merge)
    tmp_file = Tempfile.new(["cdo-nces.", ".dat"])
    begin
      puts "Downloading #{s3_key}..."
      client = Aws::S3::Client.new
      open(tmp_file.path, 'wb') do |tmp|
        client.get_object(bucket: 'cdo-nces', key: s3_key) do |chunk|
          tmp.write(chunk)
        end
      end
      insert_count = 0
      update_count = 0
      CSV.foreach(tmp_file.path, csv_options) do |row|
        parsed_school = parse(row)
        school = School.find_by_id(parsed_school[:id])
        if school.nil?
          #school = School.new(parsed_school)
          insert_count += 1
        else
          # TODO: merge the parsed school with school
          update_count += 1
        end
        #school.save! if merge
      end
      puts "Processed #{insert_count + update_count} school(s); #{insert_count} insert(s), #{update_count} update(s)."
    ensure
      tmp_file.close
      tmp_file.unlink
    end
  end

  # Loads all the NCES datafiles into the current dataset.
  # @param load_all [Boolean] true if merging the datasets, false otherwise
  def self.load_all(merge)
    NcesSchoolsLoader::Ccd20132014.instance.load(merge)
    NcesSchoolsLoader::Pss20132014.instance.load(merge)
    NcesSchoolsLoader::Ccd20142015.instance.load(merge)
    NcesSchoolsLoader::Ccd20152016.instance.load(merge)
    NcesSchoolsLoader::Pcc20152016.instance.load(merge)
    NcesSchoolsLoader::Ccd20162015.instance.load(merge)
    return self
  end

  # Download the data in the schools table to a TSV file.
  # @return [String} the TSV file
  def self.to_tsv
    tsv_file = "#{Dir.tmpdir}/schools.#{Time.now.strftime('%Y%m%d%H%M')}.tsv"
    CSV.open(tsv_file, 'w', {col_sep: "\t", headers: true, quote_char: "\x00"}) do |csv|
      csv << %w(id school_district_id school_type name address_line1 address_line2 address_line3 city state zip)
      School.order(:id).map do |school|
        csv << [
          school[:id],
          school[:school_district_id],
          school[:school_type],
          school[:name],
          school[:address_line1],
          school[:address_line2],
          school[:address_line3],
          school[:city],
          school[:state],
          school[:zip]
        ]
      end
    end
    return tsv_file
  end

  # NCES Public/Charter School Directory for 2013-2014
  # @see https://nces.ed.gov/ccd/Data/txt/sc132alay.txt
  class Ccd20132014 < NcesSchoolsLoader
    include Singleton

    def initialize
      super('2013-2014/ccd/sc132a.txt', {col_sep: "\t", headers: true, quote_char: "\x00"})
    end

    def parse(row)
      return {
        id:                 row['NCESSCH'].to_i.to_s,
        school_district_id: row['LEAID'].to_i,
        school_type:        row['CHARTR'] == '1' ? 'charter' : 'public',
        name:               row['SCHNAM'].upcase,
        address_line1:      row['LSTREE'].nil? ? nil : row['LSTREE'].upcase,
        address_line2:      nil,
        address_line3:      nil,
        city:               row['LCITY'].upcase,
        state:              row['LSTATE'].upcase,
        zip:                row['LZIP']
      }
    end
  end

  # NCES Private School Directory for 2013-2014
  # @see https://nces.ed.gov/surveys/pss/zip/layout2013_14.zip
  class Pss20132014 < NcesSchoolsLoader
    include Singleton

    def initialize
      super('2013-2014/pss/pss1314_pu.csv', {col_sep: ",", headers: true, quote_char: '"'})
    end

    def parse(row)
      return {
        id:                 row['PPIN'],
        school_district_id: nil,
        school_type:        'private',
        name:               row['PINST'].upcase,
        address_line1:      row[row['PL_ADD'].nil? ? 'PADDRS' : 'PL_ADD'].upcase,
        address_line2:      nil,
        address_line3:      nil,
        city:               row[row['PL_CIT'].nil? ? 'PCITY' : 'PL_CIT'].upcase,
        state:              row[row['PL_STABB'].nil? ? 'PSTABB' : 'PL_STABB'].upcase,
        zip:                row[row['PL_ZIP'].nil? ? 'PZIP' : 'PL_ZIP']
      }
    end
  end

  # NCES Public/Charter School Directory for 2014-2015
  # @see https://nces.ed.gov/ccd/xls/2014-15%20CCD%20Companion_SCH%20Directory_File_Layout.xlsx
  class Ccd20142015 < NcesSchoolsLoader
    include Singleton

    def initialize
      super('2014-2015/ccd/ccd_sch_029_1415_w_0216601a.txt', {col_sep: "\t", headers: true, quote_char: "\x00"})
    end

    def parse(row)
      return {
        id:                 row['NCESSCH'].to_i.to_s,
        school_district_id: row['LEAID'].to_i,
        school_type:        row['CHARTER_TEXT'][0, 1] == 'Y' ? 'charter' : 'public',
        name:               row['SCH_NAME'].upcase,
        address_line1:      row['LSTREET1'].nil? ? nil : row['LSTREET1'].upcase,
        address_line2:      row['LSTREET2'].nil? ? nil : row['LSTREET2'].upcase,
        address_line3:      row['LSTREET3'].nil? ? nil : row['LSTREET3'].upcase,
        city:               row['LCITY'].upcase,
        state:              row['LSTATE'].nil? ? nil : row['LSTATE'].upcase,
        zip:                row['LZIP']
      }
    end
  end

  # NCES Public/Charter School Directory for 2015-2016
  # @see https://nces.ed.gov/ccd/xls/2015-16_CCD_Companion_SCH_Directory.xlsx
  class Ccd20152016 < NcesSchoolsLoader
    include Singleton

    def initialize
      super('2015-2016/ccd/ccd_sch_029_1516_txt_prel.tab', {col_sep: "\t", headers: true, quote_char: "\x00"})
    end

    def parse(row)
      return {
        id:                 row['NCESSCH'].to_i.to_s,
        school_district_id: row['LEAID'].to_i,
        school_type:        row['CHARTER_TEXT'][0, 1] == 'Y' ? 'charter' : 'public',
        name:               row['SCH_NAME'].upcase,
        address_line1:      row['LSTREET1'].nil? ? nil : row['LSTREET1'].upcase,
        address_line2:      row['LSTREET2'].nil? ? nil : row['LSTREET2'].upcase,
        address_line3:      row['LSTREET3'].nil? ? nil : row['LSTREET3'].upcase,
        city:               row['LCITY'].upcase,
        state:              row['LSTATE'].nil? ? nil : row['LSTATE'].upcase,
        zip:                row['LZIP']
      }
    end
  end

  # NCES Private School Directory for 2015-2016
  # @see https://nces.ed.gov/surveys/pss/zip/layout2015_16.zip
  class Pss20152016 < NcesSchoolsLoader
    include Singleton

    def initialize
      super('2015-2016/pss/pss1516_pu.csv', {col_sep: ",", headers: true, quote_char: '"'})
    end

    def parse(row)
      return {
        id:                 row['ppin'],
        school_district_id: nil,
        school_type:        'private',
        name:               row['pinst'].upcase,
        address_line1:      row[row['pl_add'].nil? ? 'paddrs' : 'pl_add'].upcase,
        address_line2:      nil,
        address_line3:      nil,
        city:               row[row['pl_cit'].nil? ? 'pcity' : 'pl_cit'].upcase,
        state:              row[row['pl_stabb'].nil? ? 'pstabb' : 'pl_stabb'].upcase,
        zip:                row[row['pl_zip'].nil? ? 'pzip' : 'pl_zip']
      }
    end
  end

  # NCES Public/Charter School Directory for 2016-2017
  # @see https://nces.ed.gov/ccd/xls/2016-17_CCD_Companion_SCH_Directory_Layout.xlsx
  class Ccd20162017 < NcesSchoolsLoader
    include Singleton

    def initialize
      super('2016-2017/ccd/ccd_sch_029_1617_w_prel_050317.csv', {col_sep: ",", headers: true, quote_char: '"'})
    end

    def parse(row)
      return {
        id:                 row['NCESSCH'].to_i.to_s,
        school_district_id: row['LEAID'].to_i,
        school_type:        row['CHARTER_TEXT'][0, 1] == 'Y' ? 'charter' : 'public',
        name:               row['SCH_NAME'].upcase,
        address_line1:      row['LSTREET1'].nil? ? nil : row['LSTREET1'].upcase,
        address_line2:      row['LSTREET2'].nil? ? nil : row['LSTREET2'].upcase,
        address_line3:      row['LSTREET3'].nil? ? nil : row['LSTREET3'].upcase,
        city:               row['LCITY'].upcase,
        state:              row['LSTATE'].nil? ? nil : row['LSTATE'].upcase,
        zip:                row['LZIP']
      }
    end
  end
end

tsv_file = NcesSchoolsLoader.load_all(false).to_tsv
puts "Downloaded schools to: #{tsv_file}"
