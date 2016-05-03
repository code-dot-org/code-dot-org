# == Schema Information
#
# Table name: plps
#
#  id         :integer          not null, primary key
#  name       :string(255)      not null
#  contact_id :integer          not null
#  urban      :boolean
#
# Indexes
#
#  index_plps_on_name  (name)
#

class Plp < ActiveRecord::Base
  belongs_to :contact, class_name: 'User'
end
