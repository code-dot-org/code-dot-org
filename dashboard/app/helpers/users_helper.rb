require 'cdo/activity_constants'
require 'cdo/shared_constants'
require 'cdo/firehose'
require 'honeybadger/ruby'

module UsersHelper
  include ApplicationHelper
  include SharedConstants

  # Move section membership and (for teachers) section ownership from source_user to
  # destination_user and destroy source_user.
  # Returns a boolean - true if all steps were successful, false otherwise.
  def move_sections_and_destroy_source_user(source_user:, destination_user:, takeover_type:, provider:)
    # No-op if source_user is nil
    return true unless source_user.present?

    firehose_params = {
      source_user: source_user,
      destination_user: destination_user,
      type: takeover_type,
      provider: provider,
    }

    if source_user.has_activity?
      # We don't want to destroy an account with progress. Log to Redshift and return false.
      firehose_params[:type] = "cancelled-#{takeover_type}"
      firehose_params[:error] = "Attempted takeover for account with progress."
      log_account_takeover_to_firehose(firehose_params)
      return false
    end

    ActiveRecord::Base.transaction do
      # Move over sections that source_user follows
      Follower.where(student_user_id: source_user.id).each do |followed|
        followed.update!(student_user_id: destination_user.id)
      end

      # If both users are teachers, transfer ownership of sections
      if source_user.teacher? && destination_user.teacher?
        Section.where(user: source_user).each do |owned_section|
          owned_section.update! user: destination_user
        end
      end

      source_user.destroy!
    end

    log_account_takeover_to_firehose(firehose_params)
    true
  rescue
    false
  end

  def log_account_takeover_to_firehose(source_user:, destination_user:, type:, provider:, error: nil)
    FirehoseClient.instance.put_record(
      :analysis,
      {
        study: 'user-soft-delete-audit-v2',
        event: "#{type}-account-takeover", # Silent or OAuth takeover
        user_id: source_user.id, # User account being "taken over" (deleted)
        data_int: destination_user.id, # User account after takeover
        data_string: provider, # OAuth provider
        data_json: {
          user_type: destination_user.user_type,
          error: error,
        }.to_json
      }
    )
  end

  # Summarize a user and their progress within a certain script.
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

    user_data[:current_lesson] = user.next_unpassed_progression_level(script)&.lesson&.id unless exclude_level_progress || script.script_levels.empty?

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
      user_data[:linesOfCodeText] = I18n.t('nav.popup.lines', lines: user_data[:linesOfCode])
    end
    user_data
  end

  # Get level progress for a set of users within this script.
  # @param [Enumerable<User>] users
  # @param [Script] script
  # @return [Hash]
  # Example return value (where 1 and 2 are userIds and 135 and 136 are levelIds):
  #   {
  #     "1": {
  #       "135": {"status": "perfect", "result": 100}
  #       "136": {"status": "perfect", "result": 100}
  #     },
  #     "2": {
  #       "135": {"status": "perfect", "result": 100}
  #       "136": {"status": "perfect", "result": 100}
  #     }
  #   }
  def script_progress_for_users(users, script)
    user_levels = User.user_levels_by_user_by_level(users, script)
    paired_user_levels_by_user = PairedUserLevel.pairs_by_user(users)
    progress_by_user = users.inject({}) do |progress, user|
      progress[user.id] = merge_user_progress_by_level(
        script: script,
        user: user,
        user_levels_by_level: user_levels[user.id],
        paired_user_levels: paired_user_levels_by_user[user.id],
        include_timestamp: true
      )
      progress
    end
    timestamp_by_user = progress_by_user.transform_values do |user|
      user.values.map {|level| level[:last_progress_at]}.compact.max
    end

    [progress_by_user, timestamp_by_user]
  end

  # Merge the progress for the specified script and user into the user_data result hash.
  private def merge_script_progress(user_data, user, script, exclude_level_progress = false)
    return user_data unless user

    if script.professional_learning_course?
      user_data[:professionalLearningCourse] = true
      unit_assignment = Plc::EnrollmentUnitAssignment.find_by(user: user, plc_course_unit: script.plc_course_unit)
      if unit_assignment
        user_data[:focusAreaLessonIds] = unit_assignment.focus_area_lesson_ids
        user_data[:changeFocusAreaPath] = script_preview_assignments_path script
      end
    end

    unless exclude_level_progress
      user_levels_by_level = user.user_levels_by_level(script)
      paired_user_levels = PairedUserLevel.pairs(user_levels_by_level.values.map(&:id))
      user_data[:completed] = Policies::ScriptActivity.completed?(user, script)
      user_data[:progress] = merge_user_progress_by_level(
        script: script,
        user: user,
        user_levels_by_level: user_levels_by_level,
        paired_user_levels: paired_user_levels
      )
    end

    user_data
  end

  # Merges and summarizes a user's level progress for a particular script.
  # @param [Script] script
  # @param [User] user
  # @param [Hash<Integer, UserLevel>] user_levels_by_level
  #   A map from level id to UserLevel instance for the provided user, passed
  #   in instead of derived from the first two arguments so we can retrieve
  #   this in advance for many users in some use cases.
  # @param [Enumerable<Integer>] paired_user_levels
  #   A collection of UserLevel ids where the user was pairing.
  # @param [Boolean] include_timestamp
  #   Whether time_spent should be included in progress summary for a level
  # @return [Hash<Integer, Hash>]
  #   a map from level_id to a progress summary for the level.
  private def merge_user_progress_by_level(
    script:,
    user:,
    user_levels_by_level:,
    paired_user_levels:,
    include_timestamp: false
  )
    progress = {}
    script.script_levels.each do |sl|
      sl.level_ids.each do |level_id|
        level = Level.cache_find(level_id)

        if level.is_a?(BubbleChoice) # we have a parent level
          bubble_choice_progress = get_bubble_choice_progress(
            level, user, user_levels_by_level, sl, paired_user_levels, include_timestamp
          )
          if bubble_choice_progress
            progress.merge!(bubble_choice_progress.compact)
          end
          next
        end

        contained_level_id = level.contained_levels.try(:first).try(:id)
        ul = user_levels_by_level.try(:[], contained_level_id || level_id)
        level_progress = get_level_progress(
          ul, sl, paired_user_levels, include_timestamp
        )

        next unless level_progress

        # if status is nil or not_tried, we don't need to get pages completed
        status = level_progress[:status]
        unless status.nil? || status == LEVEL_STATUS.not_tried
          # if the level has multiple pages, we add an additional
          # array of booleans indicating which pages have been completed.
          level_progress[:pages_completed] = get_pages_completed(user, sl)
        end

        progress[level_id] = level_progress.compact
      end
    end
    progress
  end

  # Summarizes a user's progress on a particular level
  private def get_level_progress(
    user_level,
    script_level,
    paired_user_levels,
    include_timestamp
  )
    # if we don't have a user level, that means the user doesn't have any
    # progress on this level, so the client interprets a nil value as not_tried.
    # however, the default state of a lockable level is locked, so if the
    # lesson is lockable, we need to indicate that the level is locked.
    if user_level.nil?
      if script_level.lesson.lockable?
        return {locked: true}
      else
        return nil
      end
    end

    return {
      status: activity_css_class(user_level),
      locked: user_level.show_as_locked?(script_level.lesson) || nil,
      result: user_level.best_result || nil,
      paired: (paired_user_levels.include? user_level.id) || nil,
      last_progress_at: include_timestamp ? user_level.updated_at&.to_i : nil,
      time_spent: user_level.time_spent&.to_i
    }.compact
  end

  # Summarizes a user's level progress for bubble choice level
  # (parent level and sublevels)
  private def get_bubble_choice_progress(
    level,
    user,
    user_levels_by_level,
    script_level,
    paired_user_levels,
    include_timestamp
  )
    progress = {}
    sum_time_spent = 0
    best_progress = nil

    # get progress for sublevels to save in levels hash
    level.sublevels.each do |sublevel|
      ul = user_levels_by_level.try(:[], sublevel.id)
      sublevel_progress = get_level_progress(ul, script_level, paired_user_levels, include_timestamp)
      next unless sublevel_progress

      progress[sublevel.id] = sublevel_progress
      sum_time_spent += sublevel_progress[:time_spent] || 0
      if !best_progress || sublevel_progress[:result] > best_progress[:result]
        best_progress = sublevel_progress
      end
    end

    # if we don't have a best progress, we don't have any progress
    return nil if best_progress.nil?

    progress[level.id] = best_progress.clone
    progress[level.id][:time_spent] = sum_time_spent if sum_time_spent > 0
    progress
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
    level.pages.each do |page|
      page_valid_result_count = 0

      # Retrieve the level information for the embedded levels.
      embedded_levels = page.levels
      embedded_levels.reject! {|l| l.type == 'FreeResponse' && l.optional == 'true'}
      embedded_levels.each do |embedded_level|
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
        elsif page_valid_result_count == embedded_levels.length
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
      sum = summary[:progress][l.id]; sum && %w(perfect passed).include?(sum[:status])
    end
    (100.0 * completed / levels.count).round(2)
  end
end
