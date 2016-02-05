# == Schema Information
#
# Table name: professional_learning_courses
#
#  id         :integer          not null, primary key
#  name       :string(255)
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# This class represents a course that a user (really a teacher) will take. For more details about PLC class structure
# see http://wiki.code.org/display/Operations/Explanation+of+PLC+Model

class ProfessionalLearningCourse < ActiveRecord::Base
  has_many :learning_modules, class_name: 'LearningModule', dependent: :destroy
  has_many :artifacts, through: :learning_modules, dependent: :destroy
  has_many :user_course_enrollments, dependent: :destroy
end
