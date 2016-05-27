# == Schema Information
#
# Table name: pd_district_payment_terms
#
#  id          :integer          not null, primary key
#  district_id :integer
#  course      :string(255)      not null
#  rate_type   :string(255)      not null
#  rate        :decimal(8, 2)    not null
#
# Indexes
#
#  index_pd_district_payment_terms_on_district_id_and_course  (district_id,course)
#

class Pd::DistrictPaymentTerm < ActiveRecord::Base
  RATE_TYPES = [
    RATE_HOURLY = 'hourly',
    RATE_DAILY = 'daily'
  ]
  validates_inclusion_of :rate_type, in: RATE_TYPES
  belongs_to :district
end
