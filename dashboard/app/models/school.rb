# == Schema Information
#
# Table name: schools
#
#  id                 :integer
#  school_district_id :integer
#  name               :string(255)
#  school_type        :string(255)
#  survey_year        :integer
#  created_at         :datetime         not null
#  updated_at         :datetime         not null
#
# Indexes
#
#  index_schools_on_school_district_id  (school_district_id)
#

class School < ActiveRecord::Base
  include Seeded

  CURRENT_SURVEY_YEAR = 2014

  # The listing of all US schools comes from http://nces.ed.gov/ccd/pubagency.asp
  # and is then exported into a tab-separated file.
  # The data format is described at http://nces.ed.gov/ccd/pdf/2015150_sc132a_Documentation_052716.pdf
  CSV_HEADERS = {
    :id => 'NCESSCH',
    :school_district_id => 'LEAID',
    :name => 'SCHNAM',
    :charter_status => 'CHARTR',
    :survey_year => 'SURVYEAR',
  }

  # Use the zero byte as the quote character to allow importing double quotes
  #   via http://stackoverflow.com/questions/8073920/importing-csv-quoting-error-is-driving-me-nuts
  CSV_IMPORT_OPTIONS = { col_sep: "\t", headers: true, quote_char: "\x00" }

  def self.find_or_create_all_from_tsv!(filename)
    created = []
    CSV.read(filename, CSV_IMPORT_OPTIONS).each do |row|
      created << self.first_or_create_from_tsv_row!(row)
    end
    created
  end

  SCHOOL_TYPE = {
    public: 'public',
    charter: 'charter'
  }

  def self.school_type(charter_status)
    charter_status == '1' ? SCHOOL_TYPE[:charter] : SCHOOL_TYPE[:public]
  end

  def self.first_or_create_from_tsv_row!(row_data)
    params = {
      id: row_data[CSV_HEADERS[:id]],
      school_district_id: row_data[CSV_HEADERS[:school_district_id]],
      name: row_data[CSV_HEADERS[:name]],
      school_type: school_type(row_data[CSV_HEADERS[:charter_status]]),
      survey_year: row_data[CSV_HEADERS[:survey_year]],
    }
    School.where(params).first_or_create!
  end
end
