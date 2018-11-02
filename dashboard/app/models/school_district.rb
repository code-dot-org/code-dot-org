# == Schema Information
#
# Table name: school_districts
#
#  id         :integer          not null, primary key
#  name       :string(255)      not null
#  city       :string(255)      not null
#  state      :string(255)      not null
#  zip        :string(255)      not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_school_districts_on_name_and_city  (name,city)
#  index_school_districts_on_state          (state)
#

class SchoolDistrict < ActiveRecord::Base
  include Seeded

  has_many :regional_partners_school_districts
  has_many :regional_partners, through: :regional_partners_school_districts

  # Use the zero byte as the quote character to allow importing double quotes
  #   via http://stackoverflow.com/questions/8073920/importing-csv-quoting-error-is-driving-me-nuts
  CSV_IMPORT_OPTIONS = {col_sep: "\t", headers: true, quote_char: "\x00"}.freeze

  # Gets the seeding file name.
  # @param stub_school_data [Boolean] True for stub file.
  def self.get_seed_filename(stub_school_data)
    stub_school_data ? 'test/fixtures/school_districts.tsv' : 'config/school_districts.tsv'
  end

  # Seeds all the data from the source file.
  # @param options [Hash] Optional map of options.
  def self.seed_all(options = {})
    options[:stub_school_data] ||= CDO.stub_school_data

    if options[:stub_school_data]
      # use a much smaller dataset in environments that reseed data frequently.
      school_districts_tsv = get_seed_filename(true)
      SchoolDistrict.transaction do
        merge_from_csv(school_districts_tsv)
      end
      # Temporarily commenting out the case where we run the full seed_from_s3
      # (i.e., in production) in order to separately run seed_from_s3
      # manually so as not to slow down the production deploy.
      # else
      #   SchoolDistrict.seed_from_s3
    end
  end

  def self.seed_from_s3
    SchoolDistrict.transaction do
      CDO.log.info "Seeding 2013-2014 school district data"
      AWS::S3.seed_from_file('cdo-nces', "2013-2014/ccd/ag131a_supp.txt") do |filename|
        SchoolDistrict.merge_from_csv(filename, CSV_IMPORT_OPTIONS, false) do |row|
          {
            id:    row['LEAID'].to_i,
            name:  row['NAME'].upcase,
            city:  row['LCITY'].to_s.upcase.presence,
            state: row['LSTATE'].to_s.upcase.presence,
            zip:   row['LZIP']
          }
        end
      end

      CDO.log.info "Seeding 2014-2015 school district data"
      AWS::S3.seed_from_file('cdo-nces', "2014-2015/ccd/ccd_lea_029_1415_w_0216161ar.txt") do |filename|
        SchoolDistrict.merge_from_csv(filename, CSV_IMPORT_OPTIONS, false) do |row|
          {
            id:    row['LEAID'].to_i,
            name:  row['LEA_NAME'].upcase,
            city:  row['LCITY'].to_s.upcase.presence,
            state: row['LSTATE'].to_s.upcase.presence,
            zip:   row['LZIP']
          }
        end
      end

      CDO.log.info "Seeding 2017-2018 school district data"
      import_options_1718 = {col_sep: ",", headers: true, quote_char: "\x00"}
      AWS::S3.seed_from_file('cdo-nces', "2017-2018/ccd/ccd_lea_029_1718_w_0a_03302018.csv") do |filename|
        SchoolDistrict.merge_from_csv(filename, import_options_1718, false) do |row|
          {
            id:    row['LEAID'].to_i,
            name:  row['LEA_NAME'].upcase,
            city:  row['LCITY'].to_s.upcase.presence,
            state: row['LSTATE'].to_s.upcase.presence,
            zip:   row['LZIP']
          }
        end
      end
    end
  end

  # Loads/merges the data from a CSV into the schools table.
  # Requires a block to parse the row.
  # @param filename [String] The CSV file name.
  # @param options [Hash] The CSV file parsing options.
  # @param write_updates [Boolean] Specify whether existing rows should be updated.  Default to true for backwards compatible with existing logic that calls this method to UPSERT school districts.
  def self.merge_from_csv(filename, options = CSV_IMPORT_OPTIONS, write_updates = true)
    CSV.read(filename, options).each do |row|
      parsed = block_given? ? yield(row) : row.to_hash.symbolize_keys
      loaded = find_by_id(parsed[:id])
      if loaded.nil?
        SchoolDistrict.new(parsed).save!
      elsif write_updates
        loaded.assign_attributes(parsed)
        loaded.update!(parsed) if loaded.changed?
      end
    end
  end

  # Download the data in the table to a CSV file.
  # @param filename [String] The CSV file name.
  # @param options [Hash] The CSV file parsing options.
  # @return [String] The CSV file name.
  def self.write_to_csv(filename, options = CSV_IMPORT_OPTIONS)
    cols = %w(id name city state zip)
    CSV.open(filename, 'w', options) do |csv|
      csv << cols
      rows = block_given? ? yield : order(:id)
      rows.map do |row|
        csv << cols.map {|col| row[col]}
      end
    end
    return filename
  end
end
