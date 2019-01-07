require 'cdo/activity_constants'
require 'cdo/shared_constants'
require 'cdo/firehose'
require 'honeybadger/ruby'

module UsersHelper
  include ApplicationHelper
  include SharedConstants

  ACCT_TAKEOVER_EXPIRATION = 'account_takeover_expiration'
  ACCT_TAKEOVER_PROVIDER = 'clever_link_flag'
  ACCT_TAKEOVER_UID = 'clever_takeover_id'
  ACCT_TAKEOVER_OAUTH_TOKEN = 'clever_takeover_token'
  ACCT_TAKEOVER_FORCE_TAKEOVER = 'force_clever_takeover'

  # Move followed sections from source_user to destination_user and destroy source_user.
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
      if destination_user.student?
        Follower.where(student_user_id: source_user.id).each do |followed|
          followed.update!(student_user_id: destination_user.id)
        end
      end

      source_user.destroy!
    end

    log_account_takeover_to_firehose(firehose_params)
    true
  rescue
    false
  end

  # If Clever takeover flags are present, the current account (user) is the one that the person just
  # logged into (to prove ownership), and all the Clever details are migrated over, including sections.
  def check_and_apply_oauth_takeover(user)
    if account_takeover_in_progress?
      provider = session[ACCT_TAKEOVER_PROVIDER]
      uid = session[ACCT_TAKEOVER_UID]
      oauth_token = session[ACCT_TAKEOVER_OAUTH_TOKEN]
      clear_takeover_session_variables

      existing_account = User.find_by_credential(type: provider, id: uid)
      # No-op if move_sections_and_destroy_source_user fails
      return unless move_sections_and_destroy_source_user(
        source_user: existing_account,
        destination_user: user,
        takeover_type: 'oauth',
        provider: provider,
      )

      if user.migrated?
        success = user.add_credential(
          type: provider,
          id: uid,
          email: user.email,
          hashed_email: user.hashed_email,
          data: {
            oauth_token: oauth_token
          }.to_json
        )
        unless success
          # We want to know when this fails
          Honeybadger.notify(
            error_class: 'Failed to create AuthenticationOption during signup oauth takeover',
            error_message: "Failed for user with id #{user.id}"
          )
        end
      else
        user.provider = provider
        user.uid = uid
        user.oauth_token = oauth_token
        user.save
      end
    end
  end

  def log_account_takeover_to_firehose(source_user:, destination_user:, type:, provider:, error: nil)
    FirehoseClient.instance.put_record(
      study: 'user-soft-delete-audit-v2',
      event: "#{type}-account-takeover", # Silent or OAuth takeover
      user_id: source_user.id, # User account being "taken over" (deleted)
      data_int: destination_user.id, # User account after takeover
      data_string: provider, # OAuth provider
      data_json: {
        user_type: destination_user.user_type,
        error: error,
      }.to_json
    )
  end

  def begin_account_takeover(provider:, uid:, oauth_token:, force_takeover:)
    session[ACCT_TAKEOVER_EXPIRATION] = 5.minutes.from_now
    session[ACCT_TAKEOVER_PROVIDER] = provider
    session[ACCT_TAKEOVER_UID] = uid
    session[ACCT_TAKEOVER_OAUTH_TOKEN] = oauth_token
    session[ACCT_TAKEOVER_FORCE_TAKEOVER] = force_takeover
  end

  def clear_takeover_session_variables
    return if session.empty?
    session.delete ACCT_TAKEOVER_EXPIRATION
    session.delete ACCT_TAKEOVER_PROVIDER
    session.delete ACCT_TAKEOVER_UID
    session.delete ACCT_TAKEOVER_OAUTH_TOKEN
    session.delete ACCT_TAKEOVER_FORCE_TAKEOVER
  end

  def account_takeover_in_progress?
    session[ACCT_TAKEOVER_EXPIRATION]&.future?
  end

  def takeover_manager_options_json
    return {}.to_json unless account_takeover_in_progress?

    {
      cleverLinkFlag: session[ACCT_TAKEOVER_PROVIDER],
      userIDToMerge: session[ACCT_TAKEOVER_UID],
      mergeAuthToken: session[ACCT_TAKEOVER_OAUTH_TOKEN],
      forceConnect: session[ACCT_TAKEOVER_FORCE_TAKEOVER],
    }.to_json
  end

  def sign_out_but_preserve_takeover_state
    expiration = session[ACCT_TAKEOVER_EXPIRATION]
    provider = session[ACCT_TAKEOVER_PROVIDER]
    uid = session[ACCT_TAKEOVER_UID]
    oauth_token = session[ACCT_TAKEOVER_OAUTH_TOKEN]
    force_takeover = session[ACCT_TAKEOVER_FORCE_TAKEOVER]

    sign_out(current_user)

    session[ACCT_TAKEOVER_EXPIRATION] = expiration
    session[ACCT_TAKEOVER_PROVIDER] = provider
    session[ACCT_TAKEOVER_UID] = uid
    session[ACCT_TAKEOVER_OAUTH_TOKEN] = oauth_token
    session[ACCT_TAKEOVER_FORCE_TAKEOVER] = force_takeover
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
      user_levels_by_level = user.user_levels_by_level(script)
      paired_user_levels = PairedUserLevel.pairs(user_levels_by_level.values.map(&:id))
      user_data[:completed] = user.completed?(script)
      user_data[:levels] = merge_user_progress_by_level(
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
  # @return [Hash<Integer, Hash>]
  #   a map from level_id to a progress summary for the level.
  private def merge_user_progress_by_level(script:, user:, user_levels_by_level:, paired_user_levels:)
    levels = {}
    script.script_levels.each do |sl|
      sl.level_ids.each do |level_id|
        # if we have a contained level, use that to represent progress
        contained_level_id = Level.cache_find(level_id).contained_levels.try(:first).try(:id)
        ul = user_levels_by_level.try(:[], contained_level_id || level_id)
        completion_status = activity_css_class(ul)
        # a UL is submitted if the state is submitted UNLESS it is a peer reviewable level that has been reviewed
        submitted = !!ul.try(:submitted) &&
          !(ul.level.try(:peer_reviewable?) && [ActivityConstants::REVIEW_REJECTED_RESULT, ActivityConstants::REVIEW_ACCEPTED_RESULT].include?(ul.best_result))
        readonly_answers = !!ul.try(:readonly_answers)
        locked = ul.try(:locked?, sl.stage) || sl.stage.lockable? && !ul

        if completion_status == LEVEL_STATUS.not_tried
          # for now, we don't allow authorized teachers to be "locked"
          if locked && !user.authorized_teacher?
            levels[level_id] = {
              status: LEVEL_STATUS.locked
            }
          end
          next
        end

        levels[level_id] = {
          status: completion_status,
          result: ul.try(:best_result) || 0,
          submitted: submitted ? true : nil,
          readonly_answers: readonly_answers ? true : nil,
          paired: (paired_user_levels.include? ul.try(:id)) ? true : nil,
          locked: locked ? true : nil,
        }.compact

        # Just in case this level has multiple pages, in which case we add an additional
        # array of booleans indicating which pages have been completed.
        pages_completed = get_pages_completed(user, sl)

        next unless pages_completed

        levels[level_id][:pages_completed] = pages_completed
        pages_completed.each_with_index do |result, index|
          levels["#{level_id}_#{index}"] = {
            result: result,
            submitted: submitted ? true : nil,
            readonly_answers: readonly_answers ? true : nil
          }.compact
        end
      end
    end
    levels
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
      embedded_levels = Level.where(name: embedded_level_names).to_a
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
      sum = summary[:levels][l.id]; sum && %w(perfect passed).include?(sum[:status])
    end
    (100.0 * completed / levels.count).round(2)
  end
end
