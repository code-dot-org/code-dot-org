require 'cdo/activity_constants'
require 'cdo/share_filtering'

class ActivitiesController < ApplicationController
  include LevelsHelper

  # The action below disables the default request forgery protection from
  # application controller. We don't do request forgery protection on the
  # milestone action to permit the aggressive public caching we plan to do
  # for some script level pages.
  protect_from_forgery except: :milestone

  MAX_INT_MILESTONE = 2_147_483_647

  MIN_LINES_OF_CODE = 0
  MAX_LINES_OF_CODE = 1000

  def milestone
    # TODO: do we use the :result and :testResult params for the same thing?
    solved = ('true' == params[:result])
    script_name = ''

    if params[:script_level_id]
      @script_level = ScriptLevel.cache_find(params[:script_level_id].to_i)
      @level = params[:level_id] ? Script.cache_find_level(params[:level_id].to_i) : @script_level.oldest_active_level
      script_name = @script_level.script.name
    elsif params[:level_id]
      @level = Script.cache_find_level(params[:level_id].to_i)
    end

    # Immediately return with a "Service Unavailable" status if milestone posts are
    # disabled. (A cached view might post to this action even if milestone posts
    # are disabled in the gatekeeper.)
    # Check a second switch if we passed the last level of the script.
    # Keep this logic in sync with code-studio/reporting#sendReport on the client.
    post_milestone = Gatekeeper.allows('postMilestone', where: {script_name: script_name}, default: true)
    post_failed_run_milestone = Gatekeeper.allows('postFailedRunMilestone', where: {script_name: script_name}, default: true)
    final_level = @script_level.try(:final_level?)
    # We should only expect milestone posts if:
    #  - post_milestone is true, AND (we post on failed runs, or this was successful), or
    #  - this is the final level - we always post on final level
    unless (post_milestone && (post_failed_run_milestone || solved)) || final_level
      head 503
      return
    end

    sharing_allowed = Gatekeeper.allows('shareEnabled', where: {script_name: script_name}, default: true)
    if params[:program] && sharing_allowed
      share_failure = nil
      if @level.game.sharing_filtered?
        begin
          share_failure = ShareFiltering.find_share_failure(params[:program], locale)
        rescue OpenURI::HTTPError, IO::EAGAINWaitReadable => share_checking_error
          # If WebPurify or Geocoder fail, the program will be allowed, and we
          # retain the share_checking_error to log it alongside the level_source
          # ID below.
        end
      end

      unless share_failure || ActivityConstants.skipped?(params[:new_result].to_i)
        @level_source = LevelSource.find_identical_or_create(
          @level,
          params[:program].strip_utf8mb4
        )
        if share_checking_error
          slog(
            tag: 'share_checking_error',
            error: "#{share_checking_error.class.name}: #{share_checking_error}",
            level_source_id: @level_source.id
          )
        end
      end
    end

    if current_user && !current_user.authorized_teacher? && @script_level && @script_level.stage.lockable?
      user_level = UserLevel.find_by(
        user_id: current_user.id,
        level_id: @script_level.level.id,
        script_id: @script_level.script.id
      )
      # For lockable stages, the last script_level (which will be a LevelGroup) is the only one where
      # we actually prevent milestone requests. It will be have no user_level until it first gets unlocked
      # so having no user_level is equivalent to bein glocked
      nonsubmitted_lockable = user_level.nil? && @script_level.end_of_stage?
      # we have a lockable stage, and user_level is locked. disallow milestone requests
      if nonsubmitted_lockable || user_level.try(:locked?, @script_level.stage) || user_level.try(:readonly_answers?)
        return head 403
      end
    end

    if params[:lines]
      params[:lines] = params[:lines].to_i
      params[:lines] = 0 if params[:lines] < MIN_LINES_OF_CODE
      params[:lines] = MAX_LINES_OF_CODE if params[:lines] > MAX_LINES_OF_CODE
    end

    @level_source_image = find_or_create_level_source_image(params[:image], @level_source.try(:id))

    @new_level_completed = false
    if current_user
      track_progress_for_user if @script_level
    else
      track_progress_in_session
    end

    total_lines = if current_user && current_user.total_lines
                    current_user.total_lines
                  else
                    client_state.lines
                  end

    milestone_response_user_level = nil
    if @new_level_completed.is_a? UserLevel
      milestone_response_user_level = @new_level_completed
    end

    render json: milestone_response(
      script_level: @script_level,
      level: @level,
      total_lines: total_lines,
      solved?: solved,
      level_source: @level_source.try(:hidden) ? nil : @level_source,
      level_source_image: @level_source_image,
      activity: @activity,
      new_level_completed: @new_level_completed,
      share_failure: share_failure,
      user_level: milestone_response_user_level
    )

    if solved
      slog(
        tag: 'activity_finish',
        script_level_id: @script_level.try(:id),
        level_id: @level.id,
        user_agent: request.user_agent,
        locale: locale
      )
    end

    # log this at the end so that server errors (which might be caused by invalid input) prevent logging
    log_milestone(@level_source, params)
  end

  private

  def milestone_logger
    @@milestone_logger ||= Logger.new("#{Rails.root}/log/milestone.log")
  end

  def track_progress_for_user
    authorize! :create, Activity
    authorize! :create, UserLevel

    test_result = params[:testResult].to_i
    solved = ('true' == params[:result])

    lines = params[:lines].to_i

    # Create the activity.
    attributes = {
      user: current_user,
      level: @level,
      action: solved, # TODO: I think we don't actually use this. (maybe in a report?)
      test_result: test_result,
      attempt: params[:attempt].to_i,
      lines: lines,
      time: [[params[:time].to_i, 0].max, MAX_INT_MILESTONE].min,
      level_source_id: @level_source.try(:id)
    }

    # Save the activity and user_level synchronously if the level might be saved
    # to the gallery (for which the activity.id and user_level.id is required).
    # This is true for levels auto-saved to the gallery, free play levels, and
    # "impressive" levels.
    synchronous_save = solved &&
        (params[:save_to_gallery] == 'true' || @level.try(:free_play) == 'true' ||
            @level.try(:impressive) == 'true' || test_result == ActivityConstants::FREE_PLAY_RESULT)

    allow_activity_writes = Gatekeeper.allows('activities', where: {script_name: @script_level.script.name}, default: true)
    if allow_activity_writes
      @activity =
        if synchronous_save
          Activity.new(attributes).tap(&:atomic_save!)
        else
          Activity.create_async!(attributes)
        end
    end
    if @script_level
      @new_level_completed =
        if synchronous_save
          User.track_level_progress_sync(
            user_id: current_user.id,
            level_id: @level.id,
            script_id: @script_level.script_id,
            new_result: test_result,
            submitted: params[:submitted] == 'true',
            level_source_id: @level_source.try(:id),
            pairing_user_ids: pairing_user_ids,
          )
        else
          current_user.track_level_progress_async(
            script_level: @script_level,
            new_result: test_result,
            submitted: params[:submitted] == "true",
            level_source_id: @level_source.try(:id),
            level: @level,
            pairing_user_ids: pairing_user_ids
          )
        end
    end

    passed = ActivityConstants.passing?(test_result)
    if lines > 0 && passed
      current_user.total_lines += lines
      # bypass validations/transactions/etc
      User.where(id: current_user.id).update_all(total_lines: current_user.total_lines)
    end

    # Blockly sends us 'undefined', 'false', or 'true' so we have to check as a
    # string value.
    if params[:save_to_gallery] == 'true' && @level_source_image && solved
      @gallery_activity = GalleryActivity.create!(
        user: current_user,
        user_level_id: @new_level_completed.try(:id),
        level_source_id: @level_source_image.level_source_id,
        autosaved: true
      )
    end
  end

  def track_progress_in_session
    # track scripts
    if @script_level.try(:script).try(:id)
      test_result = params[:testResult].to_i
      old_result = client_state.level_progress(@script_level)

      if !ActivityConstants.passing?(old_result) && ActivityConstants.passing?(test_result)
        @new_level_completed = true
      end

      client_state.add_script(@script_level.script_id)
    end
  end

  def log_milestone(level_source, params)
    log_string = 'Milestone Report:'
    log_string +=
      if current_user || session.id
        "\t#{(current_user ? current_user.id.to_s : ('s:' + session.id))}"
      else
        "\tanon"
      end
    log_string += "\t#{request.remote_ip}\t#{params[:app]}\t#{params[:level]}\t#{params[:result]}" \
                  "\t#{params[:testResult]}\t#{params[:time]}\t#{params[:attempt]}\t#{params[:lines]}"
    log_string += level_source.try(:id) ? "\t#{level_source.id}" : "\t"
    log_string += "\t#{request.user_agent}"

    milestone_logger.info log_string
  end
end
