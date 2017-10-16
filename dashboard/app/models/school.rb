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

  # Use the zero byte as the quote character to allow importing double quotes
  #   via http://stackoverflow.com/questions/8073920/importing-csv-quoting-error-is-driving-me-nuts
  CSV_IMPORT_OPTIONS = {col_sep: "\t", headers: true, quote_char: "\x00"}.freeze

  def self.find_or_create_all_from_tsv(filename)
    CSV.read(filename, CSV_IMPORT_OPTIONS).each do |row|
      first_or_create_from_tsv_row(row)
    end
  end

  private_class_method def self.first_or_create_from_tsv_row(row_data)
    params = {
      id: row_data['id'],
      school_district_id: row_data['school_district_id'],
      name: row_data['name'],
      address_line1: row_data['address_line1'],
      address_line2: row_data['address_line2'],
      address_line3: row_data['address_line3'],
      city: row_data['city'],
      state: row_data['state'],
      zip: row_data['zip'],
      school_type: row_data['school_type']
    }
    School.where(params).first_or_create!
  end

  # Loads/merges the data from a CSV into the schools table.
  # @param filename [String] The CSV file name.
  # @param options [Hash] The CSV file parsing options.
  # @param parser [Proc] The row parser.
  def self.merge_from_csv(filename, options, row_parser)
    CSV.read(filename, options).each do |row|
      parsed_school = row_parser.call(row)
      school = School.find_by_id(parsed_school[:id])
      if school.nil?
        School.new(parsed_school).save!
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
      csv << %w(id school_district_id name address_line1 address_line2 address_line3 city state zip school_type)
      School.order(:id).map do |row|
        csv << [
          row[:id],
          row[:school_district_id],
          row[:name],
          row[:address_line1],
          row[:address_line2],
          row[:address_line3],
          row[:city],
          row[:state],
          row[:zip],
          row[:school_type]
        ]
      end
    end
    return filename
  end
end
