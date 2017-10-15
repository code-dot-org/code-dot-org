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

  def self.find_or_create_all_from_tsv(filename)
    CSV.read(filename, {col_sep: "\t", headers: true, quote_char: "\x00"}).each do |row|
      School.where(row).first_or_create!
    end
  end

  # Download the data in the schools table to a TSV file.
  # @param filename [String] the TSC file name
  # @return [String} the TSV file name
  def self.all_to_tsv(filename)
    CSV.open(filename, 'w', {col_sep: "\t", headers: true, quote_char: "\x00"}) do |csv|
      csv << %w(id school_district_id school_type name address_line1 address_line2 address_line3 city state zip)
      School.order(:id).map do |school|
        csv << [
          school[:id],
          school[:school_district_id],
          school[:school_type],
          school[:name],
          school[:address_line1],
          school[:address_line2],
          school[:address_line3],
          school[:city],
          school[:state],
          school[:zip]
        ]
      end
    end
    return filename
  end
end
