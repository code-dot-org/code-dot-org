# A Cohort is a group of teachers
class Cohort < ActiveRecord::Base
  # A Cohort attends multiple workshops
  has_many :workshops

  # A Cohort is associated with one or more Districts
  has_and_belongs_to_many :districts

  # Teachers can be in multiple cohorts
  has_and_belongs_to_many :teachers, class_name: 'User'

  # a teacher must belong to an eligible District in order to join a Cohort
  def add_teacher(teacher)
    if districts.include?(teacher.district)
      teachers << teacher
    else
      raise "Teacher ##{teacher.id}, district #{teacher.district} not eligible for cohort ##{id}."
    end
  end
end
