# == Schema Information
#
# Table name: professional_learning_courses
#
#  id   :integer          not null, primary key
#  name :string(255)
#

class ProfessionalLearningCourse < ActiveRecord::Base
  has_many :user_course_enrollments, dependent: :destroy
end
