# == Schema Information
#
# Table name: plc_courses
#
#  id         :integer          not null, primary key
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  course_id  :integer
#
# Indexes
#
#  fk_rails_d5fc777f73  (course_id)
#

class Plc::Course < ActiveRecord::Base
  has_many :plc_enrollments, class_name: '::Plc::UserCourseEnrollment', foreign_key: 'plc_course_id', dependent: :destroy
  has_many :plc_course_units, class_name: '::Plc::CourseUnit', foreign_key: 'plc_course_id', dependent: :destroy
  belongs_to :course, class_name: '::Course', foreign_key: 'course_id', dependent: :destroy, required: true

  delegate :name, to: :course
end
