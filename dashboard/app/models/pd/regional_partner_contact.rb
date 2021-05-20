# == Schema Information
#
# Table name: pd_regional_partner_contacts
#
#  id                  :integer          not null, primary key
#  user_id             :integer
#  regional_partner_id :integer
#  form_data           :text(65535)
#  created_at          :datetime         not null
#  updated_at          :datetime         not null
#
# Indexes
#
#  index_pd_regional_partner_contacts_on_regional_partner_id  (regional_partner_id)
#  index_pd_regional_partner_contacts_on_user_id              (user_id)
#
class Pd::RegionalPartnerContact < ApplicationRecord
  include Pd::Form

  belongs_to :user
  belongs_to :regional_partner

  # Note: this model and associated entities
  # have been deprecated in favor of Pd::RegionalPartnerMiniContact.
  # This model is not expected to be used
  # going forward (as of February 2020).
end
