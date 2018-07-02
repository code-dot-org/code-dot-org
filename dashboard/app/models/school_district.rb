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
    options[:force] ||= false

    # use a much smaller dataset in environments that reseed data frequently.
    school_districts_tsv = get_seed_filename(options[:stub_school_data])
    expected_count = `wc -l #{school_districts_tsv}`.to_i - 1
    raise "#{school_districts_tsv} contains no data" unless expected_count > 0

    # It takes approximately 30 seconds to seed config/school_districts.tsv.
    # Skip seeding if the data is already present. Note that this logic will
    # not re-seed data if the number of records in the DB is greater than or
    # equal to that in the TSV file, even if the data is different.
    # Stubbed data is small enough to seed it every time.
    if options[:stub_school_data] || options[:force] || SchoolDistrict.count < expected_count
      CDO.log.debug "seeding school districts (#{expected_count} rows)"
      SchoolDistrict.transaction do
        merge_from_csv(school_districts_tsv)
      end
    end
  end

  # Loads/merges the data from a CSV into the schools table.
  # Requires a block to parse the row.
  # @param filename [String] The CSV file name.
  # @param options [Hash] The CSV file parsing options.
  def self.merge_from_csv(filename, options = CSV_IMPORT_OPTIONS)
    CSV.read(filename, options).each do |row|
      parsed = block_given? ? yield(row) : row.to_hash.symbolize_keys
      loaded = find_by_id(parsed[:id])
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
      rows = block_given? ? yield : order(:id)
      rows.map do |row|
        csv << cols.map {|col| row[col]}
      end
    end
    return filename
  end
end
