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
#
# Indexes
#
#  index_plc_course_units_on_plc_course_id  (plc_course_id)
#

class Plc::CourseUnit < ActiveRecord::Base
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

  def get_top_modules_of_each_type_from_user_selections(learning_module_ids)
    # Preload all of the learning modules, that way we don't have to hit the DB multiple times
    learning_module_ids.compact!

    return [] if learning_module_ids.nil? || learning_module_ids.empty?
    learning_module_map = Hash[*Plc::LearningModule.find(learning_module_ids).flat_map {|learning_module| [learning_module.id, learning_module]}]

    #This will make a hash map of learning_module => number of times the user picked it in the evaluation, sorted with the
    #most frequently selected ones first
    searching_map = Hash[*learning_module_ids.group_by{ |v| v }.map{ |k, v| [learning_module_map[k.to_i], v.size] }.sort_by { |x| x[1] }.reverse.flatten]

    selected_learning_modules = []

    (Plc::LearningModule::MODULE_TYPES - [Plc::LearningModule::REQUIRED_MODULE]).each do |module_type|
      #Find the first element in the ordered map that is of this type
      learning_module, _ = searching_map.find { |k, _| k.module_type == module_type}.try(:first)
      selected_learning_modules << learning_module unless learning_module.nil?
    end

    selected_learning_modules
  end
end
