require 'cdo/regexp'
require 'cdo/geocoder'
require 'cdo/web_purify'

class ActivitiesController < ApplicationController
  include LevelsHelper

  # TODO: milestone is the only action so the below lines essentially do nothing. commenting out bc
  # the TODO is to figure out why (forgery protection is useful -- why can't we use it? blockly?)
  # protect_from_forgery except: :milestone

  MAX_INT_MILESTONE = 2147483647
  USER_ENTERED_TEXT_INDICATORS = ['TITLE', 'TEXT', 'title name\=\"VAL\"']

  MIN_LINES_OF_CODE = 0
  MAX_LINES_OF_CODE = 1000

  # Records level progress after each time an attempt is made
  #
  # HTTP METHOD: POST only
  #
  # GET Params
  # - user_id (required) - The user_id of the user (0 if not signed in)
  # - level_id (optional)
  # - script_level_id (optional)
  # (level_id or script_level_id is required)
  #
  # POST Params
  # - level - the level type (e.g. Custom)
  # - result - whether the level was solved
  # - testResult - maps to Activity.test_result
  # - program - the source of the user's solution
  # - save_to_gallery - whether to create a GalleryActivity
  # - time - how long the user has spent on the level
  # - attempt - attempt number
  # - lines - number of lines of code
  #
  # RETURNS json object containing
  # - design
  # - hint_view_request_url
  # - hint_view_requests
  # - level_id
  # - level_source
  # - level_source_id
  # - message
  # - phone_share_url
  # - script_id
  #
  def milestone
    # Clean up and pull out params
    save_to_gallery = params[:save_to_gallery] == 'true'
    solved = params[:result] == 'true'
    test_result = nil_or_int(params[:testResult])
    attempt = nil_or_int(params[:attempt])
    script_level_id = nil_or_int(params[:script_level_id])
    level_id = nil_or_int(params[:level_id])
    image = params[:image]
    lines = params[:lines].to_i
    program = params[:program]

    # Figure out what level and script_level we're at
    script_level = ScriptLevel.cache_find(script_level_id.to_i) if script_level_id
    if script_level
      level = script_level.level
    elsif level_id
      level = Level.find(level_id.to_i)
    end

    result = track_level_solution(
      level: level,
      program: program,
      image: image,
    )

    level_source = result[:level_source]
    level_source_image = result[:level_source_image]
    share_failure = result[:share_failure]

    lines = [[0, lines.to_i].max, MAX_LINES_OF_CODE].min if lines
    if current_user && script_level
      result = track_progress_for_user(
        level: level,
        script_level: script_level,
        test_result: test_result,
        solved: solved,
        lines: lines,
        attempt: attempt,
        save_to_gallery: save_to_gallery,
        level_source: level_source,
        level_source_image: level_source_image
      )

      activity = result[:activity]
      new_level_completed = result[:new_level_completed]
      trophy_updates = result[:trophy_updates]

    elsif !current_user
      result = track_progress_in_session(
        level: level,
        script_level: script_level,
        test_result: test_result,
      )
      new_level_completed = result[:new_level_completed]
    end

    total_lines = if current_user && current_user.total_lines
                    current_user.total_lines
                  else
                    client_state.lines
                  end

    render json: milestone_response(script_level: script_level,
                                    total_lines: total_lines,
                                    trophy_updates: trophy_updates,
                                    solved?: solved,
                                    level_source: level_source.try(:hidden) ? nil : level_source,
                                    level_source_image: level_source_image,
                                    activity: activity,
                                    new_level_completed: new_level_completed,
                                    share_failure: share_failure)

    slog(:tag => 'activity_finish',
         :script_level_id => script_level.try(:id),
         :level_id => level.id,
         :user_agent => request.user_agent,
         :locale => locale) if solved

    # log this at the end so that server errors (which might be caused by invalid input) prevent logging
    log_milestone(level_source, params, lines)
  end

  private

  def nil_or_int(value)
    if value
      value = value.to_i
    end
    value
  end

  def find_share_failure(program)
    return nil unless program.match /(#{USER_ENTERED_TEXT_INDICATORS.join('|')})/

    xml_tag_regexp = /<[^>]*>/
    program_tags_removed = program.gsub(xml_tag_regexp, "\n")

    if email = RegexpUtils.find_potential_email(program_tags_removed)
      return {message: t('share_code.email_not_allowed'), contents: email, type: 'email'}
    elsif street_address = Geocoder.find_potential_street_address(program_tags_removed)
      return {message: t('share_code.address_not_allowed'), contents: street_address, type: 'address'}
    elsif phone_number = RegexpUtils.find_potential_phone_number(program_tags_removed)
      return {message: t('share_code.phone_number_not_allowed'), contents: phone_number, type: 'phone'}
    elsif WebPurify.find_potential_profanity(program_tags_removed, ['en', locale])
      return {message: t('share_code.profanity_not_allowed'), type: 'profanity'}
    end
    nil
  end

  def milestone_logger
    @@milestone_logger ||= Logger.new("#{Rails.root}/log/milestone.log")
  end

  def track_level_solution(level:, program:, image:)
    # Validate sharablility of program text and create a level source for it
    if program
      begin
        share_failure = find_share_failure(program)
      rescue OpenURI::HTTPError => share_checking_error
        # If WebPurify fails, the program will be allowed
      end

      level_source = LevelSource.find_identical_or_create(level, program) unless share_failure
      slog(
        tag: 'share_checking_error',
        error: "#{share_checking_error}",
        level_source_id: level_source.id
      ) if share_checking_error && level_source
    end

    # Store the image only if the image is set, and the image has not been saved
    if image && level_source
      level_source_image = LevelSourceImage.find_by(level_source_id: level_source.id)

      unless level_source_image
        level_source_image = LevelSourceImage.new(level_source_id: level_source.id)
        unless level_source_image.save_to_s3(Base64.decode64(image))
          level_source_image = nil
        end
      end
    end

    {
      level_source: level_source,
      level_source_image: level_source_image,
      share_failure: share_failure
    }
  end

  def track_progress_for_user(level:, script_level:, test_result:, solved:, lines:, attempt:, save_to_gallery:, level_source_image:, level_source:)
    authorize! :create, Activity
    authorize! :create, UserLevel

    current_user.backfill_user_scripts if current_user.needs_to_backfill_user_scripts?

    activity = Activity.create!(
      user: current_user,
      level: level,
      action: solved, # TODO I think we don't actually use this. (maybe in a report?)
      test_result: test_result,
      attempt: attempt,
      lines: lines,
      time: [[params[:time].to_i, 0].max, MAX_INT_MILESTONE].min,
      level_source_id: level_source.try(:id)
    )

    new_level_completed = current_user.track_level_progress(script_level, test_result) if script_level

    passed = Activity.passing?(test_result)
    if lines > 0 && passed
      current_user.total_lines += lines
      # bypass validations/transactions/etc
      User.where(id: current_user.id).update_all(total_lines: current_user.total_lines)
    end

    if save_to_gallery && level_source_image && solved
      GalleryActivity.create!(user: current_user, activity: activity, autosaved: true)
    end

    begin
      trophy_updates = trophy_check(current_user) if passed && script_level && script_level.script.trophies
    rescue StandardError => e
      Rails.logger.error "Error updating trophy exception: #{e.inspect}"
    end

    {
      activity: activity,
      new_level_completed: new_level_completed,
      trophy_updates: trophy_updates
    }
  end

  def track_progress_in_session(level:, script_level:, test_result:)
    old_result = client_state.level_progress(level.id)

    new_level_completed = !Activity.passing?(old_result) && Activity.passing?(test_result)

    # track scripts
    if script_level.try(:script).try(:id)
      client_state.add_script(script_level.script_id)
    end

    {
      new_level_completed: new_level_completed,
    }
  end

  def trophy_check(user)
    trophy_updates = []
    # called after a new activity is logged to assign any appropriate trophies
    current_trophies = user.user_trophies.includes([:trophy, :concept]).index_by(&:concept)
    progress = user.concept_progress

    progress.each_pair do |concept, counts|
      current = current_trophies[concept]
      pct = counts[:current].to_f/counts[:max]

      new_trophy = Trophy.find_by_id case
        when pct == Trophy::GOLD_THRESHOLD
          Trophy::GOLD
        when pct >= Trophy::SILVER_THRESHOLD
          Trophy::SILVER
        when pct >= Trophy::BRONZE_THRESHOLD
          Trophy::BRONZE
        else
          # "no trophy earned"
      end

      if new_trophy
        if new_trophy.id == current.try(:trophy_id)
          # they already have the right trophy
        elsif current
          current.update_attributes!(trophy_id: new_trophy.id)
          trophy_updates << [data_t('concept.description', concept.name), new_trophy.name, view_context.image_path(new_trophy.image_name)]
        else
          UserTrophy.create!(user: user, trophy_id: new_trophy.id, concept: concept)
          trophy_updates << [data_t('concept.description', concept.name), new_trophy.name, view_context.image_path(new_trophy.image_name)]
        end
      end
    end

    trophy_updates
  end

  def log_milestone(level_source, params, lines)
    log_string = 'Milestone Report:'
    if current_user || session.id
      log_string += "\t#{(current_user ? current_user.id.to_s : ('s:' + session.id))}"
    else
      log_string += "\tanon"
    end
    log_string += "\t#{request.remote_ip}\t#{params[:app]}\t#{params[:level]}\t#{params[:result]}" +
                  "\t#{params[:testResult]}\t#{params[:time]}\t#{params[:attempt]}\t#{lines}"
    log_string += level_source.try(:id) ? "\t#{level_source.id}" : "\t"
    log_string += "\t#{request.user_agent}"

    milestone_logger.info log_string
  end
end
