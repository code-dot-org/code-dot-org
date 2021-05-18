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

# Maps a unit enrollment to all the modules that a teacher must complete in order to
# complete the unit.
#
# Normally created when a teacher enrolls in a workshop with a corresponding PLC course.
class Plc::EnrollmentModuleAssignment < ApplicationRecord
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
    Plc::EnrollmentModuleAssignment.lessons_based_status(
      [plc_learning_module.lesson],
      user,
      plc_enrollment_unit_assignment.plc_course_unit.script
    )
  end

  # Legacy PD courses do not have modules. However, they have user-completion-status for different sections
  # in similar ways - look at all the levels, and see what the user progress is for them.
  def self.lessons_based_status(lessons, user, script)
    all_levels = lessons.flat_map(&:script_levels).flat_map(&:levels)
    levels_tracked = all_levels.reject {|level| [External, ExternalLink].include?(level.class) || level.try(:peer_reviewable?)}

    user_progress_on_tracked_levels = UserLevel.where(user: user, level: levels_tracked, script: script)
    passed_levels = user_progress_on_tracked_levels.passing

    peer_reviewable_levels = all_levels.select {|level| level.try(:peer_reviewable?)}
    user_progress_on_peer_reviewable_levels = UserLevel.where(user: user, level: peer_reviewable_levels, script: script)
    passed_peer_reviewable_levels = user_progress_on_peer_reviewable_levels.where(best_result: ActivityConstants::REVIEW_ACCEPTED_RESULT)

    if levels_tracked.size == passed_levels.size && peer_reviewable_levels.size == passed_peer_reviewable_levels.size
      COMPLETED
    elsif user_progress_on_tracked_levels.empty? && user_progress_on_peer_reviewable_levels.empty?
      NOT_STARTED
    else
      IN_PROGRESS
    end
  end
end
