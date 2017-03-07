# == Schema Information
#
# Table name: regional_partners
#
#  id         :integer          not null, primary key
#  name       :string(255)      not null
#  group      :integer
#  contact_id :integer
#  urban      :boolean
#
# Indexes
#
#  index_regional_partners_on_name_and_contact_id  (name,contact_id) UNIQUE
#

class RegionalPartner < ActiveRecord::Base
  belongs_to :contact, class_name: 'User'
end
