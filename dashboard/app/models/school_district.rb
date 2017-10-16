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

  def self.find_or_create_all_from_tsv(filename)
    created = []
    CSV.read(filename, CSV_IMPORT_OPTIONS).each do |row|
      created << SchoolDistrict.where(row.symbolize_keys).first_or_create!
    end
    created
  end

  # Loads/merges the data from a CSV into the schools table.
  # Requires a block to parse the row.
  # @param filename [String] The CSV file name.
  # @param options [Hash] The CSV file parsing options.
  def self.merge_from_csv(filename, options = CSV_IMPORT_OPTIONS)
    CSV.read(filename, options).each do |row|
      parsed_school = yield row
      school = SchoolDistrict.find_by_id(parsed_school[:id])
      if school.nil?
        SchoolDistrict.new(parsed_school).save!
      else
        school.update!(parsed_school)
      end
    end
  end

  # Download the data in the table to a CSV file.
  # @param filename [String] The CSV file name.
  # @return [String] The CSV file name.
  def self.write_to_csv(filename)
    CSV.open(filename, 'w', CSV_IMPORT_OPTIONS) do |csv|
      csv << %w(id name city state zip)
      SchoolDistrict.order(:id).map do |row|
        csv << [
          row[:id],
          row[:name],
          row[:city],
          row[:state],
          row[:zip]
        ]
      end
    end
    return filename
  end
end
