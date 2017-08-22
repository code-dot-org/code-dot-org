# == Schema Information
#
# Table name: pd_regional_partner_contacts
#
#  id                  :integer          not null, primary key
#  user_id             :integer          not null
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
end
