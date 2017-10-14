require 'tempfile'

class NcesDataParser
  attr_reader :s3_key, :csv_options

  def initialize(s3_key, csv_options)
    @s3_key = s3_key.freeze
    @csv_options = csv_options.freeze
  end

  def load
    temp_file = Tempfile.new(["cdo-nces.", ".dat"])
    begin
      client = Aws::S3::Client.new
      open(temp_file.path, 'wb') do |tmp|
        client.get_object(bucket: 'cdo-nces', key: s3_key) do |chunk|
          tmp.write(chunk)
        end
      end
      CSV.foreach(temp_file.path, csv_options) do |row|
        # TODO: Here we will merge the parsed results into the current dataset
        # We can use a temporary DDB table to insert/update school information
        # then, download the results to a .tsv file to be checked-in
        puts parse(row)
      end
    ensure
      temp_file.close
      temp_file.unlink
    end
  end

  # NCES Public/Charter school directory for 2013-2014
  class Ccd20132014 < NcesDataParser
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
  class Ccd20142015 < NcesDataParser
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
end
