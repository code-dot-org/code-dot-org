# A Cohort is a group of teachers
class Cohort < ActiveRecord::Base
  # A Cohort attends multiple workshops
  has_many :workshops

  # A Cohort is associated with one or more Districts
  has_many :cohorts_districts, inverse_of: :cohort, dependent: :destroy
  has_many :districts, through: :cohorts_districts
  accepts_nested_attributes_for :cohorts_districts, allow_destroy: true

  # Teachers can be in multiple cohorts
  has_and_belongs_to_many :teachers, class_name: 'User'
end
