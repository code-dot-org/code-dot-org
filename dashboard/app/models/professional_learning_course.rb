# == Schema Information
#
# Table name: professional_learning_courses
#
#  id         :integer          not null, primary key
#  name       :string(255)
#  created_at :datetime         not null
#  updated_at :datetime         not null
#

class ProfessionalLearningCourse < ActiveRecord::Base
  has_many :learning_modules, class_name: 'LearningModule', dependent: :destroy
  has_many :artifacts, through: :learning_modules, dependent: :destroy
  has_many :user_course_enrollments, dependent: :destroy
  #Can I do this through artifacts?

  def self.create_course_with_modules name
    course = ProfessionalLearningCourse.find_or_create_by(name: name)

    3.times do
      LearningModule.create_random_learning_module_with_artifacts course
    end
  end
end
