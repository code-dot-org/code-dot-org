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
#  index_pd_course_facilitators_on_course  (course)
#

class Pd::CourseFacilitator < ActiveRecord::Base
  validates_inclusion_of :course, in: Pd::Workshop::COURSES
  belongs_to :facilitator, class_name: 'User'

  def self.facilitators_for_course(course)
    facilitator_ids = Pd::CourseFacilitator.where(course: course).map(&:facilitator_id)
    User.where(id: facilitator_ids).order(:name)
  end
end
