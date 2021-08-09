# == Schema Information
#
# Table name: pd_district_payment_terms
#
#  id                 :integer          not null, primary key
#  school_district_id :integer
#  course             :string(255)      not null
#  rate_type          :string(255)      not null
#  rate               :decimal(8, 2)    not null
#
# Indexes
#
#  index_pd_district_payment_terms_school_district_course  (school_district_id,course)
#

class Pd::DistrictPaymentTerm < ApplicationRecord
  RATE_TYPES = [
    RATE_HOURLY = 'hourly'.freeze,
    RATE_DAILY = 'daily'.freeze
  ].freeze

  belongs_to :school_district

  validates_inclusion_of :rate_type, in: RATE_TYPES
end
