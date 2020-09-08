require 'cdo/script_config'
require 'dynamic_config/dcdo'
require 'dynamic_config/gatekeeper'
require 'cdo/script_constants'

class ScriptLevelsController < ApplicationController
  check_authorization
  include LevelsHelper
  include ScriptConstants
  include VersionRedirectOverrider

  # Default s-maxage to use for script level pages which are configured as
  # publicly cacheable.  Used if the DCDO.public_proxy_max_age is not defined.
  DEFAULT_PUBLIC_PROXY_MAX_AGE = 3.minutes

  # Default max-age to use for script level pages which are configured as
  # publicly cacheable. Used if the DCDO.public_max_age is not defined.
  # This is set to twice the proxy max-age because of a bug in CloudFront.
  DEFAULT_PUBLIC_CLIENT_MAX_AGE = DEFAULT_PUBLIC_PROXY_MAX_AGE * 2

  before_action :disable_session_for_cached_pages
  before_action :set_redirect_override, only: [:show]

  def disable_session_for_cached_pages
    if ScriptLevelsController.cachable_request?(request)
      request.session_options[:skip] = true
    end
  end

  # Return true if request is one that can be publicly cached.
  def self.cachable_request?(request)
    script = ScriptLevelsController.get_script(request)
    script && ScriptConfig.allows_public_caching_for_script(script.name) &&
      !ScriptConfig.uncached_script_level_path?(request.path)
  end

  def reset
    authorize! :read, ScriptLevel
    @script = Script.get_from_cache(params[:script_id])
    prevent_caching

    # delete the client state and other session state if the user is not signed in
    # and start them at the beginning of the script.
    # If the user is signed in, continue normally.
    redirect_path = build_script_level_path(@script.starting_level)

    if current_user
      redirect_to(redirect_path)
    else
      client_state.reset
      reset_session
      destroy_storage_id_cookie

      @redirect_path = redirect_path
      render 'levels/reset_and_redirect', formats: [:html], layout: false
    end
  end

  def next
    authorize! :read, ScriptLevel
    @script = ScriptLevelsController.get_script(request)

    if @script.redirect_to?
      redirect_to "/s/#{@script.redirect_to}/next"
      return
    end
    configure_caching(@script)
    if @script.finish_url && Policies::ScriptActivity.completed?(current_user, @script)
      redirect_to @script.finish_url
      return
    end
    path = build_script_level_path(next_script_level)
    path += "?section_id=#{params[:section_id]}" if params[:section_id]
    redirect_to(path) && return
  end

  use_database_pool show: :persistent
  def show
    @current_user = current_user && User.includes(:teachers).where(id: current_user.id).first
    authorize! :read, ScriptLevel
    @script = ScriptLevelsController.get_script(request)
    @tts_autoplay_enabled = current_user&.sections_as_student&.map(&:tts_autoplay_enabled)&.reduce(false, :|)

    # Redirect to the same script level within @script.redirect_to.
    # There are too many variations of the script level path to use
    # a path helper, so use a regex to compute the new path.
    if @script.redirect_to?
      new_script = Script.get_from_cache(@script.redirect_to)
      new_path = request.fullpath.sub(%r{^/s/#{params[:script_id]}/}, "/s/#{new_script.name}/")

      if ScriptConstants::FAMILY_NAMES.include?(params[:script_id])
        Script.log_redirect(params[:script_id], new_script.name, request, 'unversioned-script-level-redirect', current_user&.user_type)
      end

      # avoid a redirect loop if the string substitution failed
      if new_path == request.fullpath
        redirect_to build_script_level_path(new_script.starting_level)
        return
      end

      redirect_to new_path
      return
    end

    configure_caching(@script)
    load_script_level

    if current_user && current_user.script_level_hidden?(@script_level)
      view_options(full_width: true)
      render 'levels/_hidden_stage'
      return
    end

    # If the stage is not released yet (visible_after is in the future) then don't
    # let a user go to the script_level page in that stage
    return head(:forbidden) unless @script_level.lesson.published?(current_user)

    # In the case of puzzle_page or sublevel_position, send param through to be included in the
    # generation of the script level path.
    extra_params = {}
    if @script_level.long_assessment?
      extra_params[:puzzle_page] = params[:puzzle_page] ? params[:puzzle_page] : 1
    end
    extra_params[:sublevel_position] = params[:sublevel_position] if @script_level.bubble_choice?

    can_view_version = @script_level&.script&.can_view_version?(current_user, locale: locale)
    override_redirect = VersionRedirectOverrider.override_script_redirect?(session, @script_level&.script)
    if can_view_version
      # If user is allowed to see level but is assigned to a newer version of the level's script,
      # we will show a dialog for the user to choose whether they want to go to the newer version.
      @redirect_script_url = @script_level&.script&.redirect_to_script_url(current_user, locale: request.locale)
    elsif !override_redirect && redirect_script = redirect_script(@script_level&.script, request.locale)
      # Redirect user to the proper script overview page if we think they ended up on the wrong level.
      redirect_to script_path(redirect_script) + "?redirect_warning=true"
      return
    end

    if request.path != (canonical_path = build_script_level_path(@script_level, extra_params))
      canonical_path << "?#{request.query_string}" unless request.query_string.empty?
      redirect_to canonical_path, status: :moved_permanently
      return
    end

    load_user
    return if performed?
    load_section

    @level = select_level
    return if redirect_under_13_without_tos_teacher(@level)

    present_level
  end

  # Get a list of hidden stages for the current users section
  def hidden_stage_ids
    authorize! :read, ScriptLevel

    stage_ids = current_user ? current_user.get_hidden_stage_ids(params[:script_id]) : []

    render json: stage_ids
  end

  # toggles whether or not a stage is hidden for a section
  def toggle_hidden
    script_id = params.require(:script_id)
    section_id = params.require(:section_id).to_i
    stage_id = params[:stage_id]
    # this is "true" in tests but true in non-test requests
    should_hide = params.require(:hidden) == "true" || params.require(:hidden) == true

    section = Section.find(section_id)
    authorize! :read, section

    if stage_id
      # TODO(asher): change this to use a cache
      stage = Lesson.find(stage_id)
      return head :forbidden unless stage.try(:script).try(:hideable_lessons)
      section.toggle_hidden_stage(stage, should_hide)
    else
      # We don't have a stage id, implying we instead want to toggle the hidden state of this script
      script = Script.get_from_cache(script_id)
      return head :bad_request if script.nil?
      section.toggle_hidden_script(script, should_hide)
    end

    render json: []
  end

  def stage_extras
    authorize! :read, ScriptLevel

    if current_user&.teacher?
      if params[:section_id]
        @section = current_user.sections.find_by(id: params[:section_id])
        @user = @section&.students&.find_by(id: params[:user_id])
      # If we have no url param and only one section make sure that is the section we are using
      elsif current_user.sections.length == 1
        @section = current_user.sections[0]
        @user = @section&.students&.find_by(id: params[:user_id])
      end
      # This errs on the side of showing the warning by only if the script we are in
      # is the assigned script for the section
      @show_stage_extras_warning = !@section&.lesson_extras && @section&.script&.name == params[:script_id]
    end

    # Explicitly return 404 here so that we don't get a 5xx in get_from_cache.
    # A 404 (or 410) tells search engine crawlers to stop requesting these URLs.
    return head :not_found if ScriptConstants::FAMILY_NAMES.include?(params[:script_id])

    @script = Script.get_from_cache(params[:script_id])
    @stage = @script.stage_by_relative_position(params[:stage_position].to_i)

    if params[:id]
      @script_level = Script.cache_find_script_level params[:id]
      @level = @script_level.level
    elsif params[:level_name]
      @level = Level.find_by_name params[:level_name]
      @script_level = @level.script_levels.find_by_script_id(@script.id) if @level
    end

    if @level
      @game = @level.game
      present_level
      return
    end

    @stage = Script.get_from_cache(params[:script_id]).stage_by_relative_position(params[:stage_position].to_i)
    @script = @stage.script
    @stage_extras = {
      next_stage_number: @stage.next_level_number_for_lesson_extras(current_user),
      stage_number: @stage.relative_position,
      next_level_path: @stage.next_level_path_for_lesson_extras(current_user),
      bonus_levels: @script.get_bonus_script_levels(@stage, current_user),
    }.camelize_keys
    @bonus_level_ids = @stage.script_levels.where(bonus: true).map(&:level_ids).flatten

    render 'scripts/stage_extras'
  end

  # Provides a JSON summary of a particular stage, that is consumed by tools used to
  # build lesson plans
  def summary_for_lesson_plans
    require_levelbuilder_mode
    authorize! :read, ScriptLevel

    script = Script.get_from_cache(params[:script_id])

    stage =
      if params[:stage_position]
        script.stage_by_relative_position(params[:stage_position])
      else
        script.stage_by_relative_position(params[:lockable_stage_position], true)
      end

    render json: stage.summary_for_lesson_plans
  end

  def self.get_script(request)
    script_id = request.params[:script_id]
    # Due to a programming error, we have been inadvertently passing user: nil
    # to Script.get_script_family_redirect_for_user . Since end users may be
    # depending on this incorrect behavior, and we are trying to deprecate this
    # codepath anyway, the current plan is to not fix this bug.
    script = ScriptConstants::FAMILY_NAMES.include?(script_id) ?
      Script.get_script_family_redirect_for_user(script_id, user: nil, locale: request.locale) :
      Script.get_from_cache(script_id)

    raise ActiveRecord::RecordNotFound unless script
    script
  end

  private

  # Configure http caching for the given script. Caching is disabled unless the
  # Gatekeeper configuration for 'script' specifies that it is publicly
  # cachable, in which case the max-age and s-maxage headers are set based the
  # 'public-max-age' DCDO configuration value.  Because of a bug in Amazon Cloudfront,
  # we actually set max-age to twice the value of s-maxage, to avoid Cloudfront serving
  # stale content which has to be revalidated by the client. The details of the bug are
  # described here:
  # https://console.aws.amazon.com/support/home?region=us-east-1#/case/?caseId=1540449361&displayId=1540449361&language=en
  def configure_caching(script)
    if script && ScriptConfig.allows_public_caching_for_script(script.name) &&
      !ScriptConfig.uncached_script_level_path?(request.path)
      max_age = DCDO.get('public_max_age', DEFAULT_PUBLIC_CLIENT_MAX_AGE)
      proxy_max_age = DCDO.get('public_proxy_max_age', DEFAULT_PUBLIC_PROXY_MAX_AGE)
      response.headers['Cache-Control'] = "public,max-age=#{max_age},s-maxage=#{proxy_max_age}"
    else
      prevent_caching
    end
  end

  def next_script_level
    user_or_session_level || @script.starting_level
  end

  def user_or_session_level
    if current_user
      current_user.next_unpassed_visible_progression_level(@script)
    else
      find_next_level_for_session(@script)
    end
  end

  # Attempts to find the next unpassed level for this session and script
  def find_next_level_for_session(script)
    script.script_levels.detect do |sl|
      sl.valid_progression_level? &&
          (client_state.level_progress(sl) < Activity::MINIMUM_PASS_RESULT)
    end
  end

  def load_script_level
    @script_level =
      if params[:chapter]
        @script.get_script_level_by_chapter(params[:chapter])
      elsif params[:stage_position]
        @script.get_script_level_by_relative_position_and_puzzle_position(params[:stage_position], params[:id], false)
      elsif params[:lockable_stage_position]
        @script.get_script_level_by_relative_position_and_puzzle_position(params[:lockable_stage_position], params[:id], true)
      else
        @script.get_script_level_by_id(params[:id])
      end
    raise ActiveRecord::RecordNotFound unless @script_level
    authorize! :read, @script_level
  end

  def load_level_source
    if params[:solution] && @ideal_level_source = @level.ideal_level_source
      # load the solution for teachers clicking "See the Solution"
      authorize! :view_level_solutions, @script
      level_source = @ideal_level_source
      readonly_view_options
    elsif @user && current_user && @user != current_user
      # load other user's solution for teachers viewing their students' solution
      @user_level = UserLevel.find_by(
        user: @user,
        script: @script_level.script,
        level: @level
      )
      level_source = @user_level.try(:level_source)
      readonly_view_options
    elsif current_user
      # load user's previous attempt at this puzzle.
      @last_activity = current_user.last_attempt(@level, @script)
      level_source = @last_activity.try(:level_source)

      user_level = UserLevel.find_by(
        user: current_user,
        script: @script_level.script,
        level: @level
      )
      if user_level && user_level.submitted?
        level_view_options(
          @level.id,
          submitted: true,
          unsubmit_url: url_for(user_level)
        )
        readonly_view_options
      end
      readonly_view_options if user_level && user_level.readonly_answers?
    end

    @last_attempt = level_source.try(:data)
  end

  def load_user
    return if params[:user_id].blank?

    if current_user.nil?
      render text: 'Teacher view is not available for this puzzle', layout: true
      return
    end

    user = User.find(params[:user_id])

    # TODO: This should use cancan/authorize.
    if user.student_of?(current_user) || current_user.project_validator?
      @user = user
    end
  end

  def load_section
    if params[:section_id] && params[:section_id] != "undefined"
      section = Section.find(params[:section_id])

      # TODO: This should use cancan/authorize.
      if section.user == current_user
        @section = section
      end
    elsif current_user.try(:sections).try(:where, hidden: false).try(:count) == 1
      @section = current_user.sections.where(hidden: false).first
    end
  end

  def select_level
    # If a BubbleChoice level's sublevel has been requested, return it.
    if @script_level.bubble_choice? && params[:sublevel_position]
      sublevel = @script_level.level.sublevel_at(params[:sublevel_position].to_i - 1)
      return sublevel if sublevel
    end

    # If there's only one level in this scriptlevel, use that
    return @script_level.levels[0] if @script_level.levels.length == 1

    # If there's an override, use that
    if params[:level_name]
      specified_level = @script_level.levels.find {|l| l.name == params[:level_name]}
      return specified_level if specified_level
    end

    # For teachers, load the student's most recent attempt
    if @user && current_user != @user
      last_attempt = @user.last_attempt_for_any(@script_level.levels)
      return last_attempt.level if last_attempt
    end

    # If they've tried at least one variant before, use the most recently attempted
    # (unless overridden by a force_reload query string param)
    if current_user && !params[:force_reload]
      last_attempt = current_user.last_attempt_for_any(@script_level.levels)
      return last_attempt.level if last_attempt
    end

    # Check to see if any of the variants are part of an experiment that we're in
    if current_user && @script_level.has_experiment?
      section_as_student = current_user.sections_as_student.find_by(script: @script_level.script) ||
        current_user.sections_as_student.first
      experiment_level = @script_level.find_experiment_level(current_user, section_as_student)
      return experiment_level if experiment_level
    end

    # Otherwise return the oldest active level
    oldest_active = @script_level.oldest_active_level
    raise "No active levels found for scriptlevel #{@script_level.id}" unless oldest_active
    oldest_active
  end

  def present_level
    # All database look-ups should have already been cached by Script::script_cache_from_db
    @game = @level.game
    @stage ||= @script_level.lesson

    load_level_source

    if @level.try(:pages)
      puzzle_page = params[:puzzle_page] || 1
      @pages = [@level.pages[puzzle_page.to_i - 1]]
      raise ActiveRecord::RecordNotFound if @pages.first.nil?
      @total_page_count = @level.pages.count
      @total_level_count = @level.levels.length
    end

    if @level.try(:peer_reviewable?)
      @peer_reviews = PeerReview.where(level: @level, submitter: current_user).where.not(data: nil, reviewer: nil)
    end

    @callback = milestone_script_level_url(
      user_id: current_user.try(:id) || 0,
      script_level_id: @script_level.id,
      level_id: @level.id
    )

    # for level groups, @level and @callback point to the parent level, so we
    # generate a url which can be used to report sublevel progress (after
    # appending the sublevel id).
    if @level.game&.level_group? || @level.try(:contained_levels).present?
      @sublevel_callback = milestone_script_level_url(
        user_id: current_user.try(:id) || 0,
        script_level_id: @script_level.id,
        level_id: ''
      )
    end

    view_options(
      full_width: true,
      small_footer: @game.uses_small_footer? || @level.enable_scrolling?,
      has_i18n: @game.has_i18n?,
      is_challenge_level: @script_level.challenge,
      is_bonus_level: @script_level.bonus,
      useGoogleBlockly: params[:blocklyVersion] == "Google"
    )
    readonly_view_options if @level.channel_backed? && params[:version]

    # Add video generation URL for only the last level of Dance
    # If we eventually want to add video generation for other levels or level
    # types, this is the condition that should be extended.
    replay_video_view_options(get_channel_for(@level, current_user)) if @level.channel_backed? && @level.is_a?(Dancelab)

    @@fallback_responses ||= {}
    @fallback_response = @@fallback_responses[@script_level.id] ||= {
      success: milestone_response(script_level: @script_level, level: @level, solved?: true),
      failure: milestone_response(script_level: @script_level, level: @level, solved?: false)
    }
    render 'levels/show', formats: [:html]
  end

  # Don't try to generate the CSRF token for forms on this page because it's cached.
  def protect_against_forgery?
    return false
  end

  def set_redirect_override
    if params[:script_id] && params[:no_redirect]
      VersionRedirectOverrider.set_script_redirect_override(session, params[:script_id])
    end
  end

  def redirect_script(script, locale)
    return nil unless script

    # Redirect the user to the latest assigned script in this family, or to the latest stable script in this family if
    # none are assigned.
    redirect_script = Script.latest_assigned_version(script.family_name, current_user)
    redirect_script ||= Script.latest_stable_version(script.family_name, locale: locale)

    # Do not redirect if we are already on the correct script.
    return nil if redirect_script == script

    redirect_script
  end
end
