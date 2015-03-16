class District < ActiveRecord::Base
  has_many :districts_users, class_name: 'DistrictsUsers'
  has_many :users, through: :districts_users
  # there is a one to one mapping between District and District Contact
  belongs_to :contact, class_name: 'User'

  # A Cohort is associated with one or more Districts
  has_many :cohorts_districts, inverse_of: :district
  has_many :districts, through: :cohorts_districts
end
