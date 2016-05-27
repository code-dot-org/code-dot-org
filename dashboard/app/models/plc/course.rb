# == Schema Information
#
# Table name: plc_courses
#
#  id         :integer          not null, primary key
#  name       :string(255)
#  created_at :datetime         not null
#  updated_at :datetime         not null
#

class Plc::Course < ActiveRecord::Base
  has_many :plc_enrollments, class_name: '::Plc::UserCourseEnrollment', foreign_key: 'plc_course_id', dependent: :destroy
  has_many :plc_course_units, class_name: '::Plc::CourseUnit', foreign_key: 'plc_course_id', dependent: :destroy
end
