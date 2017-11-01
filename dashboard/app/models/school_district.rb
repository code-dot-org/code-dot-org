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
#  index_school_districts_on_state  (state)
#

class SchoolDistrict < ActiveRecord::Base
  include Seeded

  has_many :regional_partners_school_districts
  has_many :regional_partners, through: :regional_partners_school_districts

  # Use the zero byte as the quote character to allow importing double quotes
  #   via http://stackoverflow.com/questions/8073920/importing-csv-quoting-error-is-driving-me-nuts
  CSV_IMPORT_OPTIONS = {col_sep: "\t", headers: true, quote_char: "\x00"}.freeze

  # Seeds all the data from the source file.
  # @param force [Boolean] True to force seed, false otherwise.
  def self.seed_all(force = false)
    # use a much smaller dataset in environments that reseed data frequently.
    school_districts_tsv = CDO.stub_school_data ? 'test/fixtures/school_districts.tsv' : 'config/school_districts.tsv'
    expected_count = `wc -l #{school_districts_tsv}`.to_i - 1
    raise "#{school_districts_tsv} contains no data" unless expected_count > 0

    # It takes approximately 30 seconds to seed config/school_districts.tsv.
    # Skip seeding if the data is already present. Note that this logic will
    # not re-seed data if the number of records in the DB is greater than or
    # equal to that in the TSV file, even if the data is different.
    if force || SchoolDistrict.count < expected_count
      CDO.log.debug "seeding school districts (#{expected_count} rows)"
      SchoolDistrict.transaction do
        SchoolDistrict.find_or_create_all_from_tsv(school_districts_tsv)
      end
    end
  end

  # Seeds the data from the specified TSV file.
  # @param filename [String] The TSV file.
  def self.find_or_create_all_from_tsv(filename)
    SchoolDistrict.merge_from_csv(filename) do |row|
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
      loaded = SchoolDistrict.find_by_id(parsed[:id])
      if loaded.nil?
        SchoolDistrict.new(parsed).save!
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
    cols = %w(id name city state zip)
    CSV.open(filename, 'w', options) do |csv|
      csv << cols
      SchoolDistrict.order(:id).map do |row|
        csv << cols.map {|col| row[col]}
      end
    end
    return filename
  end
end
