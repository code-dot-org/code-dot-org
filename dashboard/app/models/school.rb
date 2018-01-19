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
#  state_school_id    :string(255)
#
# Indexes
#
#  index_schools_on_id                  (id) UNIQUE
#  index_schools_on_name_and_city       (name,city)
#  index_schools_on_school_district_id  (school_district_id)
#  index_schools_on_state_school_id     (state_school_id) UNIQUE
#  index_schools_on_zip                 (zip)
#

class School < ActiveRecord::Base
  include Seeded

  self.primary_key = 'id'

  belongs_to :school_district

  has_many :school_stats_by_year

  validates :state_school_id, allow_blank: true, format: {with: /\A[A-Z]{2}-.+-.+\z/, message: "must be {State Code}-{State District Id}-{State School Id}"}

  # Gets the full address of the school.
  # @return [String] The full address.
  def full_address
    %w(address_line1 address_line2 address_line3 city state zip).map do |col|
      attributes[col].presence
    end.compact.join(' ')
  end

  # Determines if this is a high-needs school.
  # @return [Boolean] True if high-needs, false otherwise.
  def high_needs?
    stats = school_stats_by_year.order(school_year: :desc).first
    if stats.nil? || stats.frl_eligible_total.nil? || stats.students_total.nil?
      return false
    end
    stats.frl_eligible_total.to_f / stats.students_total.to_f > 0.5
  end

  # Public school ids from NCES are always 12 digits, possibly with
  # leading zeros. In the DB, those leading zeros have been stripped out.
  # Other school types are less than 12 characters and in the DB they
  # have not had their leading zeros removed.
  def self.normalize_school_id(raw_school_id)
    raw_school_id.length == 12 ? raw_school_id.to_i.to_s : raw_school_id
  end

  # Use the zero byte as the quote character to allow importing double quotes
  #   via http://stackoverflow.com/questions/8073920/importing-csv-quoting-error-is-driving-me-nuts
  CSV_IMPORT_OPTIONS = {col_sep: "\t", headers: true, quote_char: "\x00"}.freeze

  # Gets the seeding file name.
  # @param stub_school_data [Boolean] True for stub file.
  def self.get_seed_filename(stub_school_data)
    stub_school_data ? 'test/fixtures/schools.tsv' : 'config/schools.tsv'
  end

  # Seeds all the data from the source file.
  # @param options [Hash] Optional map of options.
  def self.seed_all(options = {})
    options[:stub_school_data] ||= CDO.stub_school_data
    options[:force] ||= false

    # use a much smaller dataset in environments that reseed data frequently.
    schools_tsv = get_seed_filename(options[:stub_school_data])
    expected_count = `wc -l #{schools_tsv}`.to_i - 1
    raise "#{schools_tsv} contains no data" unless expected_count > 0

    # It takes approximately 4 minutes to seed config/schools.tsv.
    # Skip seeding if the data is already present. Note that this logic will
    # not re-seed data if the number of records in the DB is greater than or
    # equal to that in the TSV file, even if the data is different.
    if options[:force] || School.count < expected_count
      CDO.log.debug "seeding schools (#{expected_count} rows)"
      School.transaction do
        merge_from_csv(schools_tsv)
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
      rows = block_given? ? yield : order(:id)
      rows.map do |row|
        csv << cols.map {|col| row[col]}
      end
    end
    return filename
  end
end
