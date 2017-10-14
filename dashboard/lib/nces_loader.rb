require 'tempfile'

class NcesLoader
  attr_reader :s3_key, :csv_options

  def initialize(s3_key, csv_options)
    @s3_key = s3_key.freeze
    @csv_options = csv_options.freeze
  end

  def load
    tmp_file = Tempfile.new(["cdo-nces.", ".dat"])
    begin
      CDO.log.info "Downloading #{s3_key}..."
      client = Aws::S3::Client.new
      open(tmp_file.path, 'wb') do |tmp|
        client.get_object(bucket: 'cdo-nces', key: s3_key) do |chunk|
          tmp.write(chunk)
        end
      end
      CDO.log.info "Parsing #{tmp_file.path}..."
      CSV.foreach(tmp_file.path, csv_options) do |row|
        # TODO: Here we will merge the parsed results into the current dataset
        # We can use a temporary DDB table to insert/update school information
        # then, download the results to a .tsv file to be checked-in
        puts parse(row)
      end
    ensure
      tmp_file.close
      tmp_file.unlink
    end
  end

  # Download the data in the schools table to a TSV file.
  # @param tsv_file [String] the TSCV file
  def self.download_to_tsv(tsv_file)
    start_time = Time.now
    CDO.log.info "Downloading schools to #{tsv_file}..."
    CSV.open(tsv_file, 'w', {col_sep: "\t", headers: true, quote_char: "\x00"}) do |csv|
      csv << %w(
        id
        school_district_id
        school_type
        name
        address_line1
        address_line2
        address_line3
        city
        state
        zip
      )
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
    CDO.log.info "Downloaded schools in #{Time.now - start_time} second(s)."
  end

  # NCES Public/Charter school directory for 2013-2014
  # @see https://nces.ed.gov/ccd/Data/txt/sc132alay.txt
  class Ccd20132014 < NcesLoader
    def initialize
      super('2013-2014/ccd/sc132a.txt', {col_sep: "\t", headers: true, quote_char: "\x00"})
    end

    def parse(row)
      return {
        id: row['NCESSCH'].to_i.to_s,
        school_district_id: row['LEAID'].to_i,
        school_type: (row['CHARTR'] == '1' ? 'charter' : 'public'),
        name: row['SCHNAM'].upcase,
        address_line1: row['LSTREE'].nil ? nil : row['LSTREE'].upcase,
        address_line2: nil,
        address_line3: nil,
        city: row['LCITY'].upcase,
        state: row['LSTATE'].upcase,
        zip: row['LZIP']
      }
    end
  end

  # NCES Public/Charter school directory for 2014-2015
  # @see https://nces.ed.gov/ccd/xls/2014-15%20CCD%20Companion_SCH%20Directory_File_Layout.xlsx
  class Ccd20142015 < NcesLoader
    def initialize
      super('2014-2015/ccd/ccd_sch_029_1415_w_0216601a.txt', {col_sep: "\t", headers: true, quote_char: "\x00"})
    end

    def parse(row)
      return {
        id: row['NCESSCH'].to_i.to_s,
        school_district_id: row['LEAID'].to_i,
        school_type: (row['CHARTER_TEXT'][0, 1] == 'Y' ? 'charter' : 'public'),
        name: row['SCH_NAME'].upcase,
        address_line1: row['LSTREET1'].nil? ? nil : row['LSTREET1'].upcase,
        address_line2: row['LSTREET2'].nil? ? nil : row['LSTREET2'].upcase,
        address_line3: row['LSTREET3'].nil? ? nil : row['LSTREET3'].upcase,
        city: row['LCITY'].upcase,
        state: row['LSTATE'].nil? ? nil : row['LSTATE'].upcase,
        zip: row['LZIP']
      }
    end
  end

  # NCES Public/Charter school directory for 2015-2016
  # @see https://nces.ed.gov/ccd/xls/2015-16_CCD_Companion_SCH_Directory.xlsx
  class Ccd20152016 < NcesLoader
    def initialize
      super('2015-2016/ccd/ccd_sch_029_1516_txt_prel.tab', {col_sep: "\t", headers: true, quote_char: "\x00"})
    end

    def parse(row)
      return {
        id: row['NCESSCH'].to_i.to_s,
        school_district_id: row['LEAID'].to_i,
        school_type: (row['CHARTER_TEXT'][0, 1] == 'Y' ? 'charter' : 'public'),
        name: row['SCH_NAME'].upcase,
        address_line1: row['LSTREET1'].nil? ? nil : row['LSTREET1'].upcase,
        address_line2: row['LSTREET2'].nil? ? nil : row['LSTREET2'].upcase,
        address_line3: row['LSTREET3'].nil? ? nil : row['LSTREET3'].upcase,
        city: row['LCITY'].upcase,
        state: row['LSTATE'].nil? ? nil : row['LSTATE'].upcase,
        zip: row['LZIP']
      }
    end
  end

  # NCES Public/Charter school directory for 2016-2017
  # @see https://nces.ed.gov/ccd/xls/2016-17_CCD_Companion_SCH_Directory_Layout.xlsx
  class Ccd20162017 < NcesLoader
    def initialize
      super('2016-2017/ccd/ccd_sch_029_1617_w_prel_050317.csv', {col_sep: ",", headers: true, quote_char: '"'})
    end

    def parse(row)
      return {
        id: row['NCESSCH'].to_i.to_s,
        school_district_id: row['LEAID'].to_i,
        school_type: (row['CHARTER_TEXT'][0, 1] == 'Y' ? 'charter' : 'public'),
        name: row['SCH_NAME'].upcase,
        address_line1: row['LSTREET1'].nil? ? nil : row['LSTREET1'].upcase,
        address_line2: row['LSTREET2'].nil? ? nil : row['LSTREET2'].upcase,
        address_line3: row['LSTREET3'].nil? ? nil : row['LSTREET3'].upcase,
        city: row['LCITY'].upcase,
        state: row['LSTATE'].nil? ? nil : row['LSTATE'].upcase,
        zip: row['LZIP']
      }
    end
  end
end
