# == Schema Information
#
# Table name: pd_plps
#
#  id         :integer          not null, primary key
#  name       :string(255)      not null
#  contact_id :integer          not null
#  urban      :boolean
#
# Indexes
#
#  index_pd_plps_on_contact_id  (contact_id)
#

class Pd::Plp < ActiveRecord::Base
  belongs_to :contact, class_name: 'User'
end
