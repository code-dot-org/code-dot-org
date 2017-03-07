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

  NO_PARTNER = 'NO PARTNER'

  validates_inclusion_of :course, in: ['csp', 'csd'], allow_nil: true
end
