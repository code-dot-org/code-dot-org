# == Schema Information
#
# Table name: plc_learning_modules
#
#  id                 :integer          not null, primary key
#  name               :string(255)
#  created_at         :datetime         not null
#  updated_at         :datetime         not null
#  plc_course_unit_id :integer          not null
#  required           :boolean
#
# Indexes
#
#  index_plc_learning_modules_on_plc_course_unit_id  (plc_course_unit_id)
#

class Plc::LearningModule < ActiveRecord::Base
  belongs_to :plc_course_unit, class_name: '::Plc::CourseUnit', foreign_key: 'plc_course_unit_id'
  has_and_belongs_to_many :plc_tasks, class_name: '::Plc::Task', foreign_key: 'plc_learning_module_id', association_foreign_key: 'plc_task_id'
  has_many :plc_module_assignments, class_name: '::Plc::EnrollmentModuleAssignment', foreign_key: 'plc_learning_module_id', dependent: :destroy
  has_many :plc_evaluation_answers, class_name: '::Plc::EvaluationAnswer', foreign_key: 'plc_learning_module_id', dependent: :destroy

  validates_presence_of :plc_course_unit_id
  attr_readonly :plc_course_unit_id
end
