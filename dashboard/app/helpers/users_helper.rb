module UsersHelper
  include ApplicationHelper

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
    user_data = {}
    merge_user_summary(user_data, user)
    merge_script_progress(user_data, user, script, exclude_level_progress)

    if script.has_peer_reviews?
      user_data[:peerReviewsPerformed] = PeerReview.get_peer_review_summaries(user, script).try(:map) do |summary|
        summary.merge(url: summary.key?(:id) ? peer_review_path(summary[:id]) : script_pull_review_path(script))
      end
    end

    user_data.compact
  end

  # Summarize a user and his or her progress across all scripts.
  # Example return value:
  # {
  #     "lines": 34, "linesOfCodeText": "Total lines of code: 34", "disableSocialShare": true,
  #     "scripts": {
  #         "course2": {
  #             "levels": {"135": {"status": "perfect", "result": 100}}},
  #         "artist": {
  #             "levels": {
  #                "1138": {"status": "attempted", "result": 5, submitted: false},
  #                "1139": {"status": "attempted", "result": 5, submitted: true},
  #                "1142": {"status": "attempted", "result": 5, pages_completed: [true, false, false], submitted: false},
  #                "1147": {"status": "perfect", "result": 30, submitted: false}}}}}
  def summarize_user_progress_for_all_scripts(user)
    user_data = {}
    merge_user_summary(user_data, user)
    user_data[:scripts] = {}
    merge_scripts_progress(user_data[:scripts], user)
    user_data
  end

  # Merge the user summary into the specified result hash.
  private def merge_user_summary(user_data, user)
    if user
      user_data[:disableSocialShare] = true if user.under_13?
      user_data[:lockableAuthorized] = user.authorized_teacher? || user.student_of_authorized_teacher?
      user_data[:isTeacher] = true if user.teacher?
      user_data[:linesOfCode] = user.total_lines
    else
      user_data[:linesOfCode] = client_state.lines
    end
    user_data[:linesOfCodeText] = I18n.t('nav.popup.lines', lines: user_data[:linesOfCode])
    user_data
  end

  # Merge the progress for all scripts into the specified result hash.
  private def merge_scripts_progress(user_data, user)
    UserLevel.where(user_id: user.id).each do |ul|
      script_id = ul.script_id
      script = Script.get_from_cache(script_id)
      script_progress = (user_data[script.name] ||= {})
      merge_script_progress(script_progress, user, script)
    end
    user_data
  end

  # Merge the progress for the specified script and user into the user_data result hash.
  private def merge_script_progress(user_data, user, script, exclude_level_progress = false)
    return user_data unless user

    if script.professional_learning_course?
      user_data[:professionalLearningCourse] = true
      unit_assignment = Plc::EnrollmentUnitAssignment.find_by(user: user, plc_course_unit: script.plc_course_unit)
      if unit_assignment
        user_data[:focusAreaPositions] = unit_assignment.focus_area_positions
        user_data[:changeFocusAreaPath] = script_preview_assignments_path script
      end
    end

    unless exclude_level_progress
      uls = user.user_levels_by_level(script)
      script_levels = script.script_levels
      user_data[:levels] = {}
      script_levels.each do |sl|
        sl.level_ids.each do |level_id|
          ul = uls.try(:[], level_id)
          completion_status = activity_css_class(ul)
          submitted = !!ul.try(:submitted)
          readonly_answers = !!ul.try(:readonly_answers)
          locked = ul.try(:locked?, sl.stage) || sl.stage.lockable? && !ul

          # for now, we don't allow authorized teachers to be "locked"
          if locked && !user.authorized_teacher?
            user_data[:levels][level_id] = {
              status: 'locked'
            }
          elsif completion_status != 'not_tried'
            user_data[:levels][level_id] = {
                status: completion_status,
                result: ul.try(:best_result) || 0,
                submitted: submitted ? true : nil,
                readonly_answers: readonly_answers ? true : nil,
                paired: ul.paired? ? true : nil
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
    level = user.last_attempt_for_any(sl.levels).try(:level) || sl.oldest_active_level

    if level.is_a? LevelGroup
      pages_completed = []

      if user.last_attempt(level).try(:level_source)
        last_attempt = JSON.parse(user.last_attempt(level).level_source.data)
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
        if page_valid_result_count == 0
          page_completed_value = nil
        elsif page_valid_result_count == page["levels"].length
          page_completed_value = ActivityConstants::FREE_PLAY_RESULT
        else
          page_completed_value = ActivityConstants::UNSUBMITTED_RESULT
        end
        pages_completed << page_completed_value
      end

      pages_completed
    end
  end

  def percent_complete(script, user = current_user)
    summary = summarize_user_progress(script, user)
    script.stages.map do |stage|
      levels = stage.script_levels.map(&:level)
      completed = levels.count{|l| sum = summary[:levels][l.id]; sum && %w(perfect passed).include?(sum[:status])}
      completed.to_f / levels.count
    end
  end

  def percent_complete_total(script, user = current_user)
    summary = summarize_user_progress(script, user)
    levels = script.script_levels.map(&:level)
    completed = levels.count{|l| sum = summary[:levels][l.id]; sum && %w(perfect passed).include?(sum[:status])}
    completed.to_f / levels.count
  end
end
