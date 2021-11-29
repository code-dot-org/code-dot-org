# == Schema Information
#
# Table name: plc_course_units
#
#  id               :integer          not null, primary key
#  plc_course_id    :integer
#  unit_name        :string(255)
#  unit_description :text(65535)
#  unit_order       :integer
#  created_at       :datetime         not null
#  updated_at       :datetime         not null
#  script_id        :integer
#  started          :boolean          default(FALSE), not null
#
# Indexes
#
#  index_plc_course_units_on_plc_course_id  (plc_course_id)
#  index_plc_course_units_on_script_id      (script_id)
#

# A named group of learning modules within a PLC course.
# Corresponds to a Script in our regular curriculum hierarchy.
class Plc::CourseUnit < ApplicationRecord
  belongs_to :script
  belongs_to :plc_course, class_name: '::Plc::Course'
  has_many :plc_learning_modules, class_name: '::Plc::LearningModule', foreign_key: 'plc_course_unit_id', dependent: :destroy
  has_many :plc_unit_assignment, class_name: '::Plc::EnrollmentUnitAssignment', foreign_key: 'plc_course_unit_id', dependent: :destroy

  validates :plc_course, presence: true

  # TODO: Migrate unit_name to name for consistency - @mehal
  def name
    unit_name
  end

  def has_evaluation?
    script.levels.where(type: 'LevelGroup').flat_map(&:levels).any? {|level| level.class == EvaluationMulti}
  end

  def deprecated?
    !!script&.deprecated
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

      next if selected_answer['lesson'].nil?

      lesson = Lesson.find_by(name: selected_answer['lesson'], script: script)
      learning_module = lesson.try(:plc_learning_module)

      next if learning_module.nil?

      learning_module_weights[learning_module] += selected_answer['weight']
    end

    learning_module_weights = learning_module_weights.sort_by {|_, weight| weight}
    sorted_learning_modules = learning_module_weights.map(&:first)

    default_module_assignments = []

    Plc::LearningModule::NONREQUIRED_MODULE_TYPES.each do |module_type|
      module_to_assign = sorted_learning_modules.find {|learning_module| learning_module.module_type == module_type}
      next if module_to_assign.nil?
      default_module_assignments << module_to_assign
    end

    default_module_assignments
  end

  # Use this command to unblock a course unit and enable enrolled teachers to start making progress in it
  def launch
    update(started: true)

    # All users who are enrolled in the course for this course unit need to be
    # enrolled in it.
    plc_course.plc_enrollments.each do |enrollment|
      assignment = Plc::EnrollmentUnitAssignment.find_or_create_by(user: enrollment.user, plc_user_course_enrollment: enrollment, plc_course_unit: self)
      assignment.update(status: Plc::EnrollmentUnitAssignment::IN_PROGRESS)
    end
  end
end
