# == Schema Information
#
# Table name: plc_course_units
#
#  id               :integer          not null, primary key
#  plc_course_id    :integer
#  unit_name        :string(255)
#  unit_description :string(255)
#  unit_order       :integer
#  created_at       :datetime         not null
#  updated_at       :datetime         not null
#  script_id        :integer
#
# Indexes
#
#  index_plc_course_units_on_plc_course_id  (plc_course_id)
#  index_plc_course_units_on_script_id      (script_id)
#

class Plc::CourseUnit < ActiveRecord::Base
  belongs_to :script
  belongs_to :plc_course, class_name: '::Plc::Course'
  has_many :plc_learning_modules, class_name: '::Plc::LearningModule', foreign_key: 'plc_course_unit_id', dependent: :destroy
  has_many :plc_evaluation_questions, class_name: '::Plc::EvaluationQuestion', foreign_key: 'plc_course_unit_id', dependent: :destroy
  has_many :plc_unit_assignment, class_name: '::Plc::EnrollmentUnitAssignment', foreign_key: 'plc_course_unit_id', dependent: :destroy

  validates :plc_course, presence: true

  def get_all_possible_learning_resources
    plc_learning_modules.map(&:plc_tasks).flatten.select{ |task| task.class == Plc::LearningResourceTask }
  end

  def get_required_learning_module_ids
    plc_learning_modules.required.pluck(:id)
  end

  def get_top_modules_of_each_type_from_user_selections(learning_module_ids_and_weights)
    # Preload all of the learning modules, that way we don't have to hit the DB multiple times
    return [] if learning_module_ids_and_weights.blank?
    learning_module_map = {}
    learning_module_ids_and_weights.each {|k, v| learning_module_map[Plc::LearningModule.find(k)] = v}

    selected_learning_modules = []

    (Plc::LearningModule::MODULE_TYPES - [Plc::LearningModule::REQUIRED_MODULE]).each do |module_type|
      #Find the first element in the ordered map that is of this type
      learning_module, _ = learning_module_map.select {|learning_module, _| learning_module.module_type == module_type}.max_by {|_, v| v}
      selected_learning_modules << learning_module unless learning_module.nil?
    end

    selected_learning_modules
  end
end
