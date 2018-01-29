require 'cdo/activity_constants'
require 'cdo/shared_constants'

module UsersHelper
  include ApplicationHelper
  include SharedConstants

  def check_and_apply_clever_takeover(user)
    if session['clever_link_flag'].present? && session['clever_takeover_id'].present? && session['clever_takeover_token'].present?
      uid = session['clever_takeover_id']
      # TODO: validate that we're not destroying an active account?
      existing_clever_account = User.where(uid: uid, provider: 'clever').first

      # Move over sections that students follow
      if user.student? && existing_clever_account
        Follower.where(student_user_id: existing_clever_account.id).each do |follower|
          follower.update(student_user_id: user.id)
        end
      end

      existing_clever_account.destroy! if existing_clever_account
      user.provider = 'clever'
      user.uid = uid
      user.oauth_token = session['clever_takeover_token']
      user.save
      clear_clever_session_variables
    end
  end

  def clear_clever_session_variables
    return if session.empty?
    session.delete('clever_link_flag')
    session.delete('clever_takeover_id')
    session.delete('clever_takeover_token')
  end

  # Summarize a user and his or her progress progress within a certain script.
  # Example return value:
  # {
  #   "linesOfCode": 34,
  #   "linesOfCodeText": "Total lines of code: 34",
  #   "disableSocialShare": true,
  #   "lockableAuthorized": true,
  #   "levels": {
  #     "135": {"status": "perfect", "result": 100}
  #   }
  # }
  def summarize_user_progress(script, user = current_user, exclude_level_progress = false)
    user_data = user_summary(user)
    merge_script_progress(user_data, user, script, exclude_level_progress)

    if script.has_peer_reviews?
      user_data[:peerReviewsPerformed] = PeerReview.get_peer_review_summaries(user, script).try(:map) do |summary|
        summary.merge(url: summary.key?(:id) ? peer_review_path(summary[:id]) : script_pull_review_path(script))
      end
    end

    user_data[:current_stage] = user.next_unpassed_progression_level(script).stage.id unless exclude_level_progress || script.script_levels.empty?

    user_data.compact
  end

  def level_with_best_progress(ids, level_progress)
    return ids[0] if ids.length == 1

    submitted_id = ids.find {|id| level_progress[id].try(:[], :submitted)}
    return submitted_id if submitted_id

    completed_pages_id = ids.find {|id| level_progress[id].try(:[], :pages_completed)}
    return completed_pages_id if completed_pages_id

    attempted_ids = ids.select {|id| level_progress[id].try(:[], :result)}
    return attempted_ids.max_by {|id| level_progress[id][:result]} unless attempted_ids.empty?

    return ids[0]
  end

  # Some summary user data we include in user_progress requests
  def user_summary(user)
    user_data = {}
    if user
      user_data[:disableSocialShare] = true if user.under_13?
      user_data[:lockableAuthorized] = user.teacher? ? user.authorized_teacher? : user.student_of_authorized_teacher?
      user_data[:isTeacher] = true if user.teacher?
      user_data[:isVerifiedTeacher] = true if user.authorized_teacher?
      user_data[:linesOfCode] = user.total_lines
    else
      user_data[:linesOfCode] = client_state.lines
    end
    user_data[:linesOfCodeText] = I18n.t('nav.popup.lines', lines: user_data[:linesOfCode])
    user_data
  end

  # Merge the progress for the specified script and user into the user_data result hash.
  private def merge_script_progress(user_data, user, script, exclude_level_progress = false)
    return user_data unless user

    if script.professional_learning_course?
      user_data[:professionalLearningCourse] = true
      unit_assignment = Plc::EnrollmentUnitAssignment.find_by(user: user, plc_course_unit: script.plc_course_unit)
      if unit_assignment
        user_data[:focusAreaStageIds] = unit_assignment.focus_area_stage_ids
        user_data[:changeFocusAreaPath] = script_preview_assignments_path script
      end
    end

    unless exclude_level_progress
      uls = user.user_levels_by_level(script)
      paired_user_level_ids = PairedUserLevel.pairs(uls.values.map(&:id))
      script_levels = script.script_levels
      user_data[:completed] = user.completed?(script)
      user_data[:levels] = {}
      script_levels.each do |sl|
        sl.level_ids.each do |level_id|
          # if we have a contained level, use that to represent progress
          contained_level_id = Level.cache_find(level_id).contained_levels.try(:first).try(:id)
          ul = uls.try(:[], contained_level_id || level_id)
          completion_status = activity_css_class(ul)
          # a UL is submitted if the state is submitted UNLESS it is a peer reviewable level that has been reviewed
          submitted = !!ul.try(:submitted) &&
              !(ul.level.try(:peer_reviewable?) && [ActivityConstants::REVIEW_REJECTED_RESULT, ActivityConstants::REVIEW_ACCEPTED_RESULT].include?(ul.best_result))
          readonly_answers = !!ul.try(:readonly_answers)
          locked = ul.try(:locked?, sl.stage) || sl.stage.lockable? && !ul

          # for now, we don't allow authorized teachers to be "locked"
          if locked && !user.authorized_teacher?
            user_data[:levels][level_id] = {
              status: LEVEL_STATUS.locked
            }
          elsif completion_status != LEVEL_STATUS.not_tried
            user_data[:levels][level_id] = {
              status: completion_status,
              result: ul.try(:best_result) || 0,
              submitted: submitted ? true : nil,
              readonly_answers: readonly_answers ? true : nil,
              paired: (paired_user_level_ids.include? ul.try(:id)) ? true : nil
            }.compact

            # Just in case this level has multiple pages, in which case we add an additional
            # array of booleans indicating which pages have been completed.
            pages_completed = get_pages_completed(user, sl)
            if pages_completed
              user_data[:levels][level_id][:pages_completed] = pages_completed
              pages_completed.each_with_index do |result, index|
                user_data[:levels]["#{level_id}_#{index}"] = {
                  result: result,
                  submitted: submitted ? true : nil,
                  readonly_answers: readonly_answers ? true : nil
                }.compact
              end
            end
          end
        end
      end
    end

    user_data
  end

  # Given a user and a script-level, returns a nil if there is only one page, or an array of
  # values if there are multiple pages.  The array contains whether each page is completed, partially
  # completed, or not yet attempted.  These values are ActivityConstants::FREE_PLAY_RESULT,
  # ActivityConstants::UNSUBMITTED_RESULT, and nil, respectively.
  #
  # Since this is currently just used for multi-page LevelGroup levels, we only check that a valid
  # (though not necessarily correct) answer has been given for each level embedded on a given page.
  def get_pages_completed(user, sl)
    # Since we only swap LevelGroups with other LevelGroups, just check levels[0]
    return nil unless sl.levels[0].is_a? LevelGroup

    last_user_level = user.last_attempt_for_any(sl.levels)
    level = last_user_level.try(:level) || sl.oldest_active_level
    pages_completed = []

    if last_user_level.try(:level_source)
      last_attempt = JSON.parse(last_user_level.level_source.data)
    end

    # Go through each page.
    level.properties["pages"].each do |page|
      page_valid_result_count = 0

      # Construct an array of the embedded level names used on the page.
      embedded_level_names = []
      page["levels"].each do |level_name|
        embedded_level_names << level_name
      end

      # Retrieve the level information for those embedded levels.  These results
      # won't necessarily match the order of level names as requested, but
      # fortunately we are just accumulating a count and don't mind the order.
      Level.where(name: embedded_level_names).each do |embedded_level|
        level_id = embedded_level.id

        # Do we have a valid result for this level in the LevelGroup last_attempt?
        if last_attempt && last_attempt.key?(level_id.to_s) && last_attempt[level_id.to_s]["valid"]
          page_valid_result_count += 1
        end
      end

      # The page is considered complete if there was a valid result for each
      # embedded level.
      page_completed_value =
        if page_valid_result_count.zero?
          nil
        elsif page_valid_result_count == page["levels"].length
          ActivityConstants::FREE_PLAY_RESULT
        else
          ActivityConstants::UNSUBMITTED_RESULT
        end
      pages_completed << page_completed_value
    end

    pages_completed
  end

  # @return [Float] The percentage, between 0.0 and 100.0, of the levels in the
  #   script that were passed or perfected.
  def percent_complete_total(script, user = current_user)
    summary = summarize_user_progress(script, user)
    levels = script.script_levels.map(&:level)
    completed = levels.count do |l|
      sum = summary[:levels][l.id]; sum && %w(perfect passed).include?(sum[:status])
    end
    (100.0 * completed / levels.count).round(2)
  end
end
