require 'cdo/script_config'
require 'dynamic_config/dcdo'
require 'dynamic_config/gatekeeper'

class ScriptLevelsController < ApplicationController
  check_authorization
  include LevelsHelper
  include VersionRedirectOverrider
  include CachedUnitHelper

  before_action :disable_session_for_cached_pages
  before_action :redirect_admin_from_labs, only: [:reset, :next, :show, :lesson_extras]
  before_action :set_redirect_override, only: [:show]

  # Return true if request is one that can be publicly cached.
  def cachable_request?(request)
    script = ScriptLevelsController.get_script(request)
    script && ScriptConfig.allows_public_caching_for_script(script.name) &&
      !ScriptConfig.uncached_script_level_path?(request.path)
  end

  def reset
    authorize! :read, ScriptLevel
    @script = Unit.get_from_cache(params[:script_id])
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

  use_reader_connection_for_route(:show)
  def show
    @current_user = current_user && User.includes(:teachers).where(id: current_user.id).first
    authorize! :read, ScriptLevel
    @script = ScriptLevelsController.get_script(request)

    if @script.is_deprecated
      return render 'errors/deprecated_course'
    end

    # @view_as_user is used to determine redirect path for bubble choice levels
    view_as_other = params[:user_id] && current_user && params[:user_id] != current_user.id
    @view_as_user = view_as_other ? User.find(params[:user_id]) : current_user

    # Redirect to the same script level within @script.redirect_to.
    # There are too many variations of the script level path to use
    # a path helper, so use a regex to compute the new path.
    if @script.redirect_to?
      new_script = Unit.get_from_cache(@script.redirect_to)
      new_path = request.fullpath.sub(%r{^/s/#{params[:script_id]}/}, "/s/#{new_script.name}/")

      if Unit.family_names.include?(params[:script_id])
        session[:show_unversioned_redirect_warning] = true unless new_script.is_course
        Unit.log_redirect(params[:script_id], new_script.name, request, 'unversioned-script-level-redirect', current_user&.user_type)
      end

      # avoid a redirect loop if the string substitution failed
      if new_path == request.fullpath
        redirect_to build_script_level_path(new_script.starting_level)
        return
      end

      redirect_to new_path
      return
    end

    @show_unversioned_redirect_warning = !!session[:show_unversioned_redirect_warning]
    session[:show_unversioned_redirect_warning] = false

    # will be true if the user is in any unarchived section where tts autoplay is enabled
    @tts_autoplay_enabled = current_user&.sections_as_student&.where({hidden: false})&.map(&:tts_autoplay_enabled)&.reduce(false, :|)

    @public_caching = configure_caching(@script)

    @script_level = ScriptLevelsController.get_script_level(@script, params)
    raise ActiveRecord::RecordNotFound unless @script_level
    # If we have a signed out user for any of these cases we will want to redirect them to sign in
    authenticate_user! if !can?(:read, @script) || @script.login_required? || (!params.nil? && params[:login_required] == "true")
    return render 'levels/no_access' unless can?(:read, @script_level)

    if current_user&.script_level_hidden?(@script_level)
      view_options(full_width: true)
      render 'levels/_hidden_lesson'
      return
    end

    # In the case of puzzle_page or sublevel_position, send param through to be included in the
    # generation of the script level path.
    @extra_params = {}
    if @script_level.long_assessment?
      @extra_params[:puzzle_page] = params[:puzzle_page] ? params[:puzzle_page] : 1
    end
    @extra_params[:sublevel_position] = params[:sublevel_position] if @script_level.bubble_choice?

    can_view_version = @script_level&.script&.can_view_version?(current_user, locale: locale)
    override_redirect = VersionRedirectOverrider.override_unit_redirect?(session, @script_level&.script)
    if can_view_version
      # If user is allowed to see level but is assigned to a newer version of the level's script,
      # we will show a dialog for the user to choose whether they want to go to the newer version.
      @redirect_unit_url = @script_level&.script&.redirect_to_unit_url(current_user, locale: request.locale)
    elsif !override_redirect && redirect_script = redirect_script(@script_level&.script, request.locale)
      # Redirect user to the proper script overview page if we think they ended up on the wrong level.
      redirect_to script_path(redirect_script) + "?redirect_warning=true"
      return
    end

    if request.path != (canonical_path = build_script_level_path(@script_level, @extra_params)) && params[:view] != 'summary'
      canonical_path << "?#{request.query_string}" unless request.query_string.empty?
      redirect_to canonical_path, status: :moved_permanently
      return
    end

    if current_user
      load_user
      load_section
    end

    @level = select_level
    return if redirect_under_13_without_tos_teacher(@level)

    # TODO: If this adds too much to the load time in prod, move it to an API.
    if current_user&.teacher?
      @responses = []
      # We use this for the level summary entry point, so on contained levels
      # what we actually care about are responses to the contained level.
      level = @level.contained_levels.any? ? @level.contained_levels.first : @level

      # TODO: Change/remove this check as we add support for more level types.
      if level.is_a?(FreeResponse) || level.is_a?(Multi)
        @responses = UserLevel.where(level: level, user: @section&.students)
      end
    end

    @body_classes = @level.properties['background']

    @rubric = @script_level.lesson.rubric
    if @rubric
      @rubric_data = {rubric: @rubric.summarize}
      if @script_level.lesson.rubric && view_as_other
        viewing_user_level = @view_as_user.user_levels.find_by(script: @script_level.script, level: @level)
        @rubric_data[:studentLevelInfo] = {
          id: @view_as_user.id,
          name: @view_as_user.name,
          attempts: viewing_user_level&.attempts,
          timeSpent: viewing_user_level&.time_spent,
          lastAttempt: viewing_user_level&.updated_at,
        }
      end
    end

    present_level
  end

  def self.get_script_level(script, params)
    if params[:chapter]
      script.get_script_level_by_chapter(params[:chapter])
    elsif params[:lesson_position]
      script.get_script_level_by_relative_position_and_puzzle_position(params[:lesson_position], params[:id], false)
    elsif params[:lockable_lesson_position]
      script.get_script_level_by_relative_position_and_puzzle_position(params[:lockable_lesson_position], params[:id], true)
    else
      script.get_script_level_by_id(params[:id])
    end
  end

  # Get a JSON summary of a level's information, used in modern labs that don't
  # reload the page between level views.  Note that this can be cached for a relatively
  # long amount of time, including by the CDN, and does not vary per user.
  def level_properties
    authorize! :read, ScriptLevel

    @script = ScriptLevelsController.get_script(request)
    @script_level = ScriptLevelsController.get_script_level(@script, params)
    raise ActiveRecord::RecordNotFound unless @script_level

    @level = @script_level.level

    render json: @level.summarize_for_lab2_properties
  end

  # Get a list of hidden lessons for the current users section
  def hidden_lesson_ids
    authorize! :read, ScriptLevel

    lesson_ids = current_user ? current_user.get_hidden_lesson_ids(params[:script_id]) : []

    render json: lesson_ids
  end

  # toggles whether or not a lesson is hidden for a section
  def toggle_hidden
    script_id = params.require(:script_id)
    section_id = params.require(:section_id).to_i
    lesson_id = params[:stage_id]
    # this is "true" in tests but true in non-test requests
    should_hide = params.require(:hidden) == "true" || params.require(:hidden) == true

    section = Section.find(section_id)
    authorize! :read, section

    if lesson_id
      # TODO(asher): change this to use a cache
      lesson = Lesson.find(lesson_id)
      return head :forbidden unless lesson.try(:script).try(:hideable_lessons)
      section.toggle_hidden_lesson(lesson, should_hide)
    else
      # We don't have a lesson id, implying we instead want to toggle the hidden state of this script
      script = Unit.get_from_cache(script_id)
      return head :bad_request if script.nil?
      section.toggle_hidden_script(script, should_hide)
    end

    render json: []
  end

  def lesson_extras
    authorize! :read, ScriptLevel

    @script = Unit.get_from_cache(params[:script_id], raise_exceptions: false)
    raise ActiveRecord::RecordNotFound unless @script

    if @script.can_be_instructor?(current_user)
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
      @show_lesson_extras_warning = !@section&.lesson_extras && @section&.script&.name == params[:script_id]
    end

    @lesson = @script.lesson_by_relative_position(params[:lesson_position].to_i)

    if params[:id]
      @script_level = Unit.cache_find_script_level params[:id]
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

    @lesson = Unit.get_from_cache(
      params[:script_id]
    ).lesson_by_relative_position(
      params[:lesson_position].to_i
      )
    @script = @lesson.script
    script_bonus_levels_by_lesson = @script.get_bonus_script_levels(@lesson)

    user = @user || current_user
    unless user.nil?
      # bonus level summaries explicitly don't contain any user-specific data,
      # so we need to merge in the user's progress.
      script_bonus_levels_by_lesson.each do |lesson|
        lesson[:levels].each do |level_summary|
          ul = UserLevel.find_by(
            level_id: level_summary[:level_id], user_id: user.id, script: @script
          )
          level_summary[:perfect] = ul&.perfect?
        end
      end
    end

    @lesson_extras = {
      next_lesson_number: @lesson.next_level_number_for_lesson_extras(user),
      lesson_number: @lesson.relative_position,
      next_level_path: @lesson.next_level_path_for_lesson_extras(user),
      bonus_levels: script_bonus_levels_by_lesson,
    }.camelize_keys
    @bonus_level_ids = @lesson.script_levels.where(bonus: true).map(
      &:level_ids
    ).flatten

    render 'scripts/lesson_extras'
  end

  # Provides a JSON summary of a particular lesson, that is consumed by tools used to
  # build lesson plans
  def summary_for_lesson_plans
    require_levelbuilder_mode
    authorize! :read, ScriptLevel

    script = Unit.get_from_cache(params[:script_id])

    lesson =
      if params[:lesson_position]
        script.lesson_by_relative_position(params[:lesson_position])
      else
        script.lesson_by_relative_position(params[:lockable_lesson_position], true)
      end

    render json: lesson.summary_for_lesson_plans
  end

  def self.get_script(request)
    script_id = request.params[:script_id]
    script = Unit.get_from_cache(script_id, raise_exceptions: false)
    if script.nil? && Unit.family_names.include?(script_id)
      # Due to a programming error, we have been inadvertently passing user: nil
      # to Unit.get_unit_family_redirect_for_user . Since end users may be
      # depending on this incorrect behavior, and we are trying to deprecate this
      # codepath anyway, the current plan is to not fix this bug.
      script = Unit.get_unit_family_redirect_for_user(script_id, user: nil, locale: request.locale)
    end
    raise ActiveRecord::RecordNotFound unless script
    script
  end

  private def next_script_level
    user_or_session_level || @script.starting_level
  end

  private def user_or_session_level
    if current_user
      current_user.next_unpassed_visible_progression_level(@script)
    else
      find_next_level_for_session(@script)
    end
  end

  # Attempts to find the next unpassed level for this session and script
  private def find_next_level_for_session(script)
    script.script_levels.detect do |sl|
      sl.valid_progression_level? &&
          (client_state.level_progress(sl) < Activity::MINIMUM_PASS_RESULT)
    end
  end

  private def load_level_source
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
      if user_level&.submitted?
        level_view_options(
          @level.id,
          submitted: true,
          unsubmit_url: url_for(user_level)
        )
        readonly_view_options
      end
      readonly_view_options if user_level&.readonly_answers?
    end

    @last_attempt = level_source.try(:data)
  end

  # Sets @user to the user object corresponding to the 'user_id' request
  # param if the current_user is allowed to view the page as the requested
  # user. This method should only be called when current_user is present.
  private def load_user
    return if params[:user_id].blank?

    # Grab bubble choice level that will be shown (if any),
    # so we can check whether a student should be able to view
    # another student's work for code review.
    sublevel_to_view = select_bubble_choice_level

    user_to_view = User.find(params[:user_id])
    if can?(:view_as_user, @script_level, user_to_view, sublevel_to_view)
      @user = user_to_view

      if can?(:view_as_user_for_code_review, @script_level, user_to_view, sublevel_to_view)
        @is_code_reviewing = true
        view_options(is_code_reviewing: true)
      end
    end
  end

  private def load_section
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

  private def select_bubble_choice_level
    return unless @script_level.bubble_choice? && params[:sublevel_position]
    @script_level.level.sublevel_at(params[:sublevel_position].to_i - 1)
  end

  private def select_level
    # If a BubbleChoice level's sublevel has been requested, return it.
    bubble_choice_level = select_bubble_choice_level
    return bubble_choice_level if bubble_choice_level

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
      experiment_level = @script_level.find_experiment_level(current_user)
      return experiment_level if experiment_level
    end

    # Otherwise return the oldest active level
    oldest_active = @script_level.oldest_active_level
    raise "No active levels found for scriptlevel #{@script_level.id}" unless oldest_active
    oldest_active
  end

  private def present_level
    # All database look-ups should have already been cached by Unit::unit_cache_from_db
    @game = @level.game
    @lesson ||= @script_level.lesson

    load_level_source

    if @level.try(:pages)
      puzzle_page = params[:puzzle_page] || 1
      @pages = [@level.pages[puzzle_page.to_i - 1]]
      raise ActiveRecord::RecordNotFound if @pages.first.nil?
      @total_page_count = @level.pages.count
      @total_level_count = @level.levels.length
    end

    if @level.try(:peer_reviewable?)
      @peer_reviews = PeerReview.where(
        level: @level, submitter: current_user
      ).where.not(data: nil).where.not(reviewer: nil)
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

    @code_review_enabled_for_level = @level.is_a?(Javalab) &&
      current_user.present? &&
      (current_user.teacher? || (current_user&.sections_as_student&.any?(&:code_review_enabled?) && !current_user.code_review_groups.empty?))

    # Javalab exemplar URLs include ?exemplar=true as a URL param
    if params[:exemplar]
      return render 'levels/no_access_exemplar' unless current_user&.verified_instructor?

      @is_viewing_exemplar = true
      exemplar_sources = @level.try(:exemplar_sources)
      return render 'levels/no_exemplar' unless exemplar_sources

      level_view_options(@level.id, {is_viewing_exemplar: true, exemplar_sources: exemplar_sources})
      readonly_view_options
    end

    view_options(
      full_width: true,
      no_footer: @game&.no_footer?,
      small_footer: @game&.uses_small_footer? || @level&.enable_scrolling?,
      has_i18n: @game.has_i18n?,
      is_challenge_level: @script_level.challenge,
      is_bonus_level: @script_level.bonus,
      blocklyVersion: params[:blocklyVersion],
      azure_speech_service_voices: azure_speech_service_options[:voices],
      authenticity_token: form_authenticity_token,
      disallowed_html_tags: disallowed_html_tags
    )

    readonly_view_options if @level.channel_backed? && params[:version].present?

    # Add video generation URL for only the last level of Dance
    # If we eventually want to add video generation for other levels or level
    # types, this is the condition that should be extended.
    replay_video_view_options(get_channel_for(@level, @script_level.script_id, current_user)) if @level.channel_backed? && @level.is_a?(Dancelab)

    @@fallback_responses ||= {}
    @fallback_response = @@fallback_responses[@script_level.id] ||= {
      success: milestone_response(script_level: @script_level, level: @level, solved?: true),
      failure: milestone_response(script_level: @script_level, level: @level, solved?: false)
    }

    @next_level_link = @script_level.next_level_or_redirect_path_for_user(current_user)

    render 'levels/show', formats: [:html]
  end

  # Don't try to generate the CSRF token for forms on this page because it's cached.
  private def protect_against_forgery?
    return false
  end

  private def set_redirect_override
    if params[:script_id] && params[:no_redirect]
      VersionRedirectOverrider.set_unit_redirect_override(session, params[:script_id])
    end
  end

  private def redirect_script(script, locale)
    return nil unless script

    # Redirect the user to the latest assigned script in this family, or to the latest stable script in this family if
    # none are assigned.
    redirect_script = Unit.latest_assigned_version(script.family_name, current_user)
    redirect_script ||= Unit.latest_stable_version(script.family_name, locale: locale)

    # Do not redirect if we are already on the correct script.
    return nil if redirect_script == script

    redirect_script
  end
end
