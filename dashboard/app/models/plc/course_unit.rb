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

  def determine_preferred_learning_modules(user)
    evaluation_level = script.levels.reverse.find {|level| level.class == LevelGroup}

    level_source = user.last_attempt(evaluation_level).try(:level_source)
    return [] if level_source.nil?

    responses = JSON.parse(level_source.data)
    learning_module_weights = Hash.new(0)

    responses.each do |level_id, response|
      next if response.nil? || response['result'].nil?

      level = EvaluationMulti.cache_find(level_id)
      selected_answer = level.answers[response['result'].to_i]

      next if selected_answer['stage'].nil?

      stage = Stage.find_by(name: selected_answer['stage'], script: script)
      learning_module = stage.try(:plc_learning_module)

      next if learning_module.nil?

      learning_module_weights[learning_module] += selected_answer['weight']
    end

    learning_module_weights = learning_module_weights.sort_by{|_, weight| weight}
    sorted_learning_modules = learning_module_weights.map(&:first)

    default_module_assignments = []

    Plc::LearningModule::NONREQUIRED_MODULE_TYPES.each do |module_type|
      module_to_assign = sorted_learning_modules.find{|learning_module| learning_module.module_type == module_type}
      next if module_to_assign.nil?
      default_module_assignments << module_to_assign.id
    end

    default_module_assignments
  end
end
