# == Schema Information
#
# Table name: plc_enrollment_module_assignments
#
#  id                                :integer          not null, primary key
#  plc_enrollment_unit_assignment_id :integer
#  plc_learning_module_id            :integer
#  created_at                        :datetime         not null
#  updated_at                        :datetime         not null
#  user_id                           :integer
#
# Indexes
#
#  index_plc_enrollment_module_assignments_on_user_id  (user_id)
#  module_assignment_enrollment_index                  (plc_enrollment_unit_assignment_id)
#  module_assignment_lm_index                          (plc_learning_module_id)
#

class Plc::EnrollmentModuleAssignment < ActiveRecord::Base
  belongs_to :plc_enrollment_unit_assignment, class_name: '::Plc::EnrollmentUnitAssignment'
  belongs_to :plc_learning_module, class_name: '::Plc::LearningModule'
  belongs_to :user

  validates :plc_enrollment_unit_assignment, presence: true
  validates :plc_learning_module, presence: true

  MODULE_STATUS_STATES = [
      NOT_STARTED = :not_started,
      IN_PROGRESS = :in_progress,
      COMPLETED = :completed
  ].freeze

  def status
    levels_tracked = plc_learning_module.stage.script_levels.map(&:levels).flatten
    levels_tracked.delete_if {|level| [External, ExternalLink].include? level.class}
    user_progress_on_tracked_levels = UserLevel.where(user: user, level: levels_tracked)
    passed_levels = user_progress_on_tracked_levels.passing

    if levels_tracked.size == passed_levels.size
      COMPLETED
    elsif user_progress_on_tracked_levels.empty?
      NOT_STARTED
    else
      IN_PROGRESS
    end
  end
end
