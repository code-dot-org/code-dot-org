# == Schema Information
#
# Table name: pd_course_facilitators
#
#  id             :integer          not null, primary key
#  facilitator_id :integer          not null
#  course         :string(255)      not null
#
# Indexes
#
#  index_pd_course_facilitators_on_course                     (course)
#  index_pd_course_facilitators_on_facilitator_id_and_course  (facilitator_id,course) UNIQUE
#

class Pd::CourseFacilitator < ApplicationRecord
  belongs_to :facilitator, class_name: 'User'

  validates_inclusion_of :course, in: Pd::Workshop::COURSES
  validates_uniqueness_of :course, scope: :facilitator_id

  def self.facilitators_for_course(course)
    User.joins(:courses_as_facilitator).
      where(table_name => {course: course}).
      order(:name)
  end
end
