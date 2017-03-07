# == Schema Information
#
# Table name: regional_partner_organizers
#
#  id                  :integer          not null, primary key
#  organizer_id        :integer          not null
#  regional_partner_id :integer          not null
#
# Indexes
#
#  index_regional_partner_organizers_on_organizer_id         (organizer_id)
#  index_regional_partner_organizers_on_regional_partner_id  (regional_partner_id)
#

class RegionalPartnerOrganizer < ActiveRecord::Base
  belongs_to :organizer, class_name: 'User'
  belongs_to :regional_partner
end
