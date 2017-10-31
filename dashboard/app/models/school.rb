# == Schema Information
#
# Table name: schools
#
#  id                 :string(12)       not null, primary key
#  school_district_id :integer
#  name               :string(255)      not null
#  city               :string(255)      not null
#  state              :string(255)      not null
#  zip                :string(255)      not null
#  school_type        :string(255)      not null
#  created_at         :datetime         not null
#  updated_at         :datetime         not null
#  address_line1      :string(50)
#  address_line2      :string(30)
#  address_line3      :string(30)
#  latitude           :decimal(8, 6)
#  longitude          :decimal(9, 6)
#
# Indexes
#
#  index_schools_on_id                  (id) UNIQUE
#  index_schools_on_name_and_city       (name,city)
#  index_schools_on_school_district_id  (school_district_id)
#  index_schools_on_zip                 (zip)
#

class School < ActiveRecord::Base
  include Seeded

  self.primary_key = 'id'

  belongs_to :school_district

  # Gets the full address of the school.
  # @return [String] The full address.
  def full_address
    %w(address_line1 address_line2 address_line3 city state zip).map do |col|
      attributes[col].presence
    end.compact.join(' ')
  end

  # Use the zero byte as the quote character to allow importing double quotes
  #   via http://stackoverflow.com/questions/8073920/importing-csv-quoting-error-is-driving-me-nuts
  CSV_IMPORT_OPTIONS = {col_sep: "\t", headers: true, quote_char: "\x00"}.freeze

  # Seeds all the data from the source file.
  # @param force [Boolean] True to force seed, false otherwise.
  def self.seed_all(force = false)
    # use a much smaller dataset in environments that reseed data frequently.
    schools_tsv = CDO.stub_school_data ? 'test/fixtures/schools.tsv' : 'config/schools.tsv'
    expected_count = `wc -l #{schools_tsv}`.to_i - 1
    raise "#{schools_tsv} contains no data" unless expected_count > 0

    # It takes approximately 4 minutes to seed config/schools.tsv.
    # Skip seeding if the data is already present. Note that this logic will
    # not re-seed data if the number of records in the DB is greater than or
    # equal to that in the TSV file, even if the data is different.
    if force || School.count < expected_count
      CDO.log.debug "seeding schools (#{expected_count} rows)"
      School.transaction do
        School.find_or_create_all_from_tsv(schools_tsv)
      end
    end
  end

  # Seeds the data from the specified TSV file.
  # @param filename [String] The TSV file.
  def self.find_or_create_all_from_tsv(filename)
    School.merge_from_csv(filename) do |row|
      row.to_hash.symbolize_keys
    end
  end

  # Loads/merges the data from a CSV into the schools table.
  # Requires a block to parse the row.
  # @param filename [String] The CSV file name.
  # @param options [Hash] The CSV file parsing options.
  def self.merge_from_csv(filename, options = CSV_IMPORT_OPTIONS)
    CSV.read(filename, options).each do |row|
      parsed = yield row
      loaded = School.find_by_id(parsed[:id])
      if loaded.nil?
        School.new(parsed).save!
      else
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
    cols = %w(id name address_line1 address_line2 address_line3 city state zip latitude longitude school_type school_district_id)
    CSV.open(filename, 'w', options) do |csv|
      csv << cols
      School.order(:id).map do |row|
        csv << cols.map {|col| row[col]}
      end
    end
    return filename
  end
end
