# == Schema Information
#
# Table name: districts
#
#  id         :integer          not null, primary key
#  name       :string(255)      not null
#  location   :string(255)
#  contact_id :integer
#  created_at :datetime
#  updated_at :datetime
#
# Indexes
#
#  index_districts_on_contact_id  (contact_id)
#  index_districts_on_name        (name)
#

class District < ActiveRecord::Base
  has_many :districts_users, class_name: 'DistrictsUsers'
  has_many :users, through: :districts_users
  # there is a one to one mapping between District and District Contact
  belongs_to :contact, class_name: 'User'

  # A Cohort is associated with one or more Districts
  has_many :cohorts_districts, inverse_of: :district, dependent: :destroy
  has_many :cohorts, through: :cohorts_districts
end
