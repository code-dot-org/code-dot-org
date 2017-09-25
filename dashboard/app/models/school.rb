# == Schema Information
#
# Table name: schools
#
#  id                 :integer          not null, primary key
#  school_district_id :integer          not null
#  name               :string(255)      not null
#  city               :string(255)      not null
#  state              :string(255)      not null
#  zip                :string(255)      not null
#  school_type        :string(255)      not null
#  created_at         :datetime         not null
#  updated_at         :datetime         not null
#
# Indexes
#
#  index_schools_on_id                  (id) UNIQUE
#  index_schools_on_school_district_id  (school_district_id)
#

class School < ActiveRecord::Base
  include Seeded

  self.primary_key = 'id'

  belongs_to :school_district

  # The listing of all US schools comes from http://nces.ed.gov/ccd/pubagency.asp
  # and is then exported into a tab-separated file.
  # The data format is described at http://nces.ed.gov/ccd/pdf/2015150_sc132a_Documentation_052716.pdf
  CSV_HEADERS = {
    id: 'NCESSCH',
    school_district_id: 'LEAID',
    name: 'SCHNAM',
    city: 'LCITY',
    state: 'LSTATE',
    zip: 'LZIP',
    charter_status: 'CHARTR',
  }.freeze

  # Use the zero byte as the quote character to allow importing double quotes
  #   via http://stackoverflow.com/questions/8073920/importing-csv-quoting-error-is-driving-me-nuts
  CSV_IMPORT_OPTIONS = {col_sep: "\t", headers: true, quote_char: "\x00"}.freeze

  def self.find_or_create_all_from_tsv(filename)
    CSV.read(filename, CSV_IMPORT_OPTIONS).each do |row|
      first_or_create_from_tsv_row(row)
    end
  end

  SCHOOL_TYPE = {
    public: 'public',
    charter: 'charter'
  }.freeze

  private_class_method def self.school_type(charter_status)
    charter_status == '1' ? SCHOOL_TYPE[:charter] : SCHOOL_TYPE[:public]
  end

  private_class_method def self.first_or_create_from_tsv_row(row_data)
    params = {
      id: row_data[CSV_HEADERS[:id]],
      school_district_id: row_data[CSV_HEADERS[:school_district_id]],
      name: row_data[CSV_HEADERS[:name]],
      city: row_data[CSV_HEADERS[:city]],
      state: row_data[CSV_HEADERS[:state]],
      zip: row_data[CSV_HEADERS[:zip]],
      school_type: school_type(row_data[CSV_HEADERS[:charter_status]]),
    }
    School.where(params).first_or_create!
  end
end
