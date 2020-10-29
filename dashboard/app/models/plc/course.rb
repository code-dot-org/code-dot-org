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

# Professional Learning Course
# A course that the teacher is taking to build their skills.
# Ex: Teaching Computer Science Principles.
# A Plc::Course is always tied to a Course in our regular curriculum hierarchy.
# A user may be enrolled in multiple courses.
class Plc::Course < ActiveRecord::Base
  has_many :plc_enrollments, class_name: '::Plc::UserCourseEnrollment', foreign_key: 'plc_course_id', dependent: :destroy
  has_many :plc_course_units, class_name: '::Plc::CourseUnit', foreign_key: 'plc_course_id', dependent: :destroy
  belongs_to :unit_group, class_name: '::UnitGroup', foreign_key: 'course_id', dependent: :destroy, required: true

  delegate :name, to: :unit_group
end
