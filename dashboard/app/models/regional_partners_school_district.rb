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

class RegionalPartnersSchoolDistrict < ApplicationRecord
  belongs_to :regional_partner
  belongs_to :school_district

  self.primary_keys = :school_district_id, :regional_partner_id

  CSV_HEADERS = {
    school_district_id: 'LEAID',
    regional_partner_name: 'RegionalPartner',
    course: 'course',
    workshop_days: 'workshop_days'
  }.freeze

  CSV_IMPORT_OPTIONS = {col_sep: "\t", headers: true}.freeze

  NO_PARTNER = 'NO PARTNER'.freeze
  COURSE_CSP = 'csp'.freeze
  COURSE_CSD = 'csd'.freeze

  validates_inclusion_of :course, in: [COURSE_CSP, COURSE_CSD], allow_nil: true

  def self.find_or_create_all_from_tsv(filename)
    CSV.read(filename, CSV_IMPORT_OPTIONS).each do |row|
      regional_partner_name = row[CSV_HEADERS[:regional_partner_name]]
      next if regional_partner_name == NO_PARTNER
      school_district_id = row[CSV_HEADERS[:school_district_id]]

      regional_partner = RegionalPartner.find_by(name: regional_partner_name)
      raise "regional partner name not found: #{regional_partner_name}" unless regional_partner
      school_district = SchoolDistrict.find(school_district_id)
      course = row[CSV_HEADERS[:course]]
      workshop_days = row[CSV_HEADERS[:workshop_days]]

      RegionalPartnersSchoolDistrict.create(school_district: school_district, regional_partner: regional_partner, course: course, workshop_days: workshop_days)
    end
  end
end
