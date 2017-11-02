# == Schema Information
#
# Table name: pd_regional_partner_mappings
#
#  id                  :integer          not null, primary key
#  regional_partner_id :integer          not null
#  state               :string(255)
#  zip_code            :string(255)
#  created_at          :datetime         not null
#  updated_at          :datetime         not null
#
# Indexes
#
#  index_pd_regional_partner_mappings_on_id_and_state_and_zip_code  (regional_partner_id,state,zip_code) UNIQUE
#  index_pd_regional_partner_mappings_on_regional_partner_id        (regional_partner_id)
#
require 'state_abbr'

class Pd::RegionalPartnerMapping < ActiveRecord::Base
  belongs_to :regional_partner

  validates_inclusion_of :state, in: STATE_ABBR_WITH_DC_HASH.keys.map(&:to_s), if: :state?
  validates :zip_code, us_zip_code: true, if: :zip_code?
  validate :zip_code_xor_state

  private

  # either zip_code or state must be populated, but not both
  def zip_code_xor_state
    unless zip_code? ^ state?
      errors[:base] << "Specify a zip code or a state, not both"
    end
  end
end
