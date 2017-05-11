# == Schema Information
#
# Table name: pd_accepted_programs
#
#  id                     :integer          not null, primary key
#  created_at             :datetime         not null
#  updated_at             :datetime         not null
#  workshop_name          :string(255)      not null
#  course                 :string(255)      not null
#  user_id                :integer          not null
#  teacher_application_id :integer
#
require 'pd/teachercon_workshops'

class Pd::AcceptedProgram < ActiveRecord::Base
  belongs_to :teacher_application, class_name: 'Pd::TeacherApplication', foreign_key: :teacher_application_id
  belongs_to :user

  validates_presence_of :workshop_name
  validates_presence_of :course
  validates_inclusion_of :course, in: Pd::TeacherApplication::PROGRAM_DETAILS_BY_COURSE.keys, if: -> {course.present?}
  validates_presence_of :user
  validates_uniqueness_of :user_id, scope: :course, message: 'already has an entry for this course'

  def teachercon?
    Pd::TeacherConWorkshops.teachercon? workshop_name
  end
end
