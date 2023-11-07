# == Schema Information
#
# Table name: potential_teachers
#
#  id                        :bigint           not null, primary key
#  name                      :string(255)
#  email                     :string(255)
#  source_course_offering_id :integer
#  created_at                :datetime         not null
#  updated_at                :datetime         not null
#  receives_marketing        :boolean
#
class PotentialTeacher < ApplicationRecord
  belongs_to :source_course_offering, class_name: 'CourseOffering'
end
