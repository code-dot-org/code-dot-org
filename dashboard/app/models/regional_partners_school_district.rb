# == Schema Information
#
# Table name: regional_partners_school_districts
#
#  regional_partner_id :integer          not null, primary key
#  school_district_id  :integer          not null, primary key
#  course              :string(255)
#  workshop_days       :string(255)
#
# Indexes
#
#  index_regional_partners_school_districts_on_partner_id          (regional_partner_id)
#  index_regional_partners_school_districts_on_school_district_id  (school_district_id)
#

class RegionalPartnersSchoolDistrict < ActiveRecord::Base
  belongs_to :regional_partner
  belongs_to :school_district

  self.primary_keys = :school_district_id, :regional_partner_id

  CSV_HEADERS = {
    school_district_id: 'LEAID',
    regional_partner_name: 'RegionalPartner',
  }.freeze

  CSV_IMPORT_OPTIONS = { col_sep: "\t", headers: true}

  NO_PARTNER = 'NO PARTNER'

  validates_inclusion_of :course, in: ['csp', 'csd'], allow_nil: true

  def self.find_or_create_all_from_tsv(filename)
    CSV.read(filename, CSV_IMPORT_OPTIONS).each do |row|
      regional_partner_name = row[CSV_HEADERS[:regional_partner_name]]
      next if regional_partner_name == NO_PARTNER
      school_district_id = row[CSV_HEADERS[:school_district_id]]

      regional_partner = RegionalPartner.find_by(name: regional_partner_name)
      raise "regional partner name not found: #{regional_partner_name}" unless regional_partner
      school_district = SchoolDistrict.find(school_district_id)

      # create the new association
      school_district.regional_partner = regional_partner
    end
  end
end
