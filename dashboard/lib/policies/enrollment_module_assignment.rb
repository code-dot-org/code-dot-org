class Policies::EnrollmentModuleAssignment
  def status
    Plc::EnrollmentModuleAssignment.stages_based_status(
      [plc_learning_module.stage],
      user,
      plc_enrollment_unit_assignment.plc_course_unit.script
    )
  end

  # Legacy PD courses do not have modules. However, they have user-completion-status for different sections
  # in similar ways - look at all the levels, and see what the user progress is for them.
  def self.stages_based_status(stages, user, script)
    all_levels = stages.flat_map(&:script_levels).flat_map(&:levels)
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
