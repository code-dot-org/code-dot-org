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
      # TODO: do we need a cache_find for Level like we have for ScriptLevel?
      @level = Level.find(params[:level_id].to_i)
    end

    # Immediately return with a "Service Unavailable" status if milestone posts are
    # disabled. (A cached view might post to this action even if milestone posts
    # are disabled in the gatekeeper.)
    enabled = Gatekeeper.allows('postMilestone', where: {script_name: script_name}, default: true)
    unless enabled
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

      unless share_failure
        @level_source = LevelSource.find_identical_or_create(@level, params[:program])
        slog(tag: 'share_checking_error', error: "#{share_checking_error.class.name}: #{share_checking_error}", level_source_id: @level_source.id) if share_checking_error
      end
    end

    if params[:lines]
      params[:lines] = params[:lines].to_i
      params[:lines] = 0 if params[:lines] < MIN_LINES_OF_CODE
      params[:lines] = MAX_LINES_OF_CODE if params[:lines] > MAX_LINES_OF_CODE
    end

    # Store the image only if the image is set, and the image has not been saved
    if params[:image] && @level_source.try(:id)
      @level_source_image = LevelSourceImage.find_by(level_source_id: @level_source.id)
      unless @level_source_image
        @level_source_image = LevelSourceImage.new(level_source_id: @level_source.id)
        unless @level_source_image.save_to_s3(Base64.decode64(params[:image]))
          @level_source_image = nil
        end
      end
    end

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

    render json: milestone_response(script_level: @script_level,
                                    level: @level,
                                    total_lines: total_lines,
                                    trophy_updates: @trophy_updates,
                                    solved?: solved,
                                    level_source: @level_source.try(:hidden) ? nil : @level_source,
                                    level_source_image: @level_source_image,
                                    activity: @activity,
                                    new_level_completed: @new_level_completed,
                                    share_failure: share_failure_for(share_failure))

    slog(:tag => 'activity_finish',
         :script_level_id => @script_level.try(:id),
         :level_id => @level.id,
         :user_agent => request.user_agent,
         :locale => locale) if solved

    # log this at the end so that server errors (which might be caused by invalid input) prevent logging
    log_milestone(@level_source, params)
  end

  private

  def share_failure_for(share_failure)
    return nil unless share_failure
    {}.tap do |failure|
      failure[:message] = share_message_for(share_failure.type)
      failure[:type] = share_failure.type
      failure[:contents] = share_failure.content unless share_failure.type == ShareFiltering::FailureType::PROFANITY
    end
  end

  def share_message_for(failure_type)
    case failure_type
      when ShareFiltering::FailureType::EMAIL
        t('share_code.email_not_allowed')
      when ShareFiltering::FailureType::ADDRESS
        t('share_code.address_not_allowed')
      when ShareFiltering::FailureType::PHONE
        t('share_code.phone_number_not_allowed')
      when ShareFiltering::FailureType::PROFANITY
        t('share_code.profanity_not_allowed')
      else
        raise ArgumentError.new("Unknown share failure type #{failure_type}")
    end
  end

  def milestone_logger
    @@milestone_logger ||= Logger.new("#{Rails.root}/log/milestone.log")
  end

  def track_progress_for_user
    authorize! :create, Activity
    authorize! :create, UserLevel

    test_result = params[:testResult].to_i
    solved = ('true' == params[:result])

    lines = params[:lines].to_i

    current_user.backfill_user_scripts if current_user.needs_to_backfill_user_scripts?

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
    # Save the activity synchronously if the level might be saved to the gallery (for which
    # the activity.id is required). This is true for levels auto-saved to the gallery, and for
    # free play and "impressive" levels.
    synchronous_save = solved &&
        (params[:save_to_gallery] == 'true' || @level.try(:free_play) == 'true' ||
            @level.try(:impressive) == 'true' || test_result == ActivityConstants::FREE_PLAY_RESULT)
    if synchronous_save
      @activity = Activity.create!(attributes)
    else
      @activity = Activity.create_async!(attributes)
    end

    if @script_level
      @new_level_completed = current_user.track_level_progress_async(
        script_level: @script_level,
        new_result: test_result,
        submitted: params[:submitted],
        level_source_id: @level_source.try(:id),
        level: @level
      )
    end

    passed = Activity.passing?(test_result)
    if lines > 0 && passed
      current_user.total_lines += lines
      # bypass validations/transactions/etc
      User.where(id: current_user.id).update_all(total_lines: current_user.total_lines)
    end

    # blockly sends us 'undefined', 'false', or 'true' so we have to check as a string value
    if params[:save_to_gallery] == 'true' && @level_source_image && solved
      @gallery_activity = GalleryActivity.create!(user: current_user, activity: @activity, autosaved: true)
    end

    begin
      trophy_check(current_user) if passed && @script_level && @script_level.script.trophies
    rescue StandardError => e
      Rails.logger.error "Error updating trophy exception: #{e.inspect}"
    end
  end

  def track_progress_in_session
    # track scripts
    if @script_level.try(:script).try(:id)
      test_result = params[:testResult].to_i
      old_result = client_state.level_progress(@script_level)

      @new_level_completed = true if !Activity.passing?(old_result) && Activity.passing?(test_result)

      client_state.add_script(@script_level.script_id)
    end
  end

  def trophy_check(user)
    @trophy_updates ||= []
    # called after a new activity is logged to assign any appropriate trophies
    current_trophies = user.user_trophies.includes([:trophy, :concept]).index_by(&:concept)
    progress = user.concept_progress

    progress.each_pair do |concept, counts|
      current = current_trophies[concept]
      pct = counts[:current].to_f/counts[:max]

      new_trophy = Trophy.find_by_id(
        case
        when pct == Trophy::GOLD_THRESHOLD
          Trophy::GOLD
        when pct >= Trophy::SILVER_THRESHOLD
          Trophy::SILVER
        when pct >= Trophy::BRONZE_THRESHOLD
          Trophy::BRONZE
        end
      )

      if new_trophy
        if new_trophy.id == current.try(:trophy_id)
          # they already have the right trophy
        elsif current
          current.update_attributes!(trophy_id: new_trophy.id)
          @trophy_updates << [data_t('concept.description', concept.name), new_trophy.name, view_context.image_path(new_trophy.image_name)]
        else
          UserTrophy.create!(user: user, trophy_id: new_trophy.id, concept: concept)
          @trophy_updates << [data_t('concept.description', concept.name), new_trophy.name, view_context.image_path(new_trophy.image_name)]
        end
      end
    end
  end

  def log_milestone(level_source, params)
    log_string = 'Milestone Report:'
    if current_user || session.id
      log_string += "\t#{(current_user ? current_user.id.to_s : ('s:' + session.id))}"
    else
      log_string += "\tanon"
    end
    log_string += "\t#{request.remote_ip}\t#{params[:app]}\t#{params[:level]}\t#{params[:result]}" +
                  "\t#{params[:testResult]}\t#{params[:time]}\t#{params[:attempt]}\t#{params[:lines]}"
    log_string += level_source.try(:id) ? "\t#{level_source.id}" : "\t"
    log_string += "\t#{request.user_agent}"

    milestone_logger.info log_string
  end
end
