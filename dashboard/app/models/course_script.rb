# == Schema Information
#
# Table name: course_scripts
#
#  id        :integer          not null, primary key
#  course_id :integer          not null
#  script_id :integer          not null
#  position  :integer          not null
#
# Indexes
#
#  index_course_scripts_on_course_id  (course_id)
#  index_course_scripts_on_script_id  (script_id)
#

class CourseScript < ApplicationRecord
  belongs_to :course
  belongs_to :script
end
