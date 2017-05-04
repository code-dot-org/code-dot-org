require 'cdo/script_config'
require 'dynamic_config/dcdo'
require 'dynamic_config/gatekeeper'

class ScriptLevelsController < ApplicationController
  check_authorization
  include LevelsHelper

  # Default s-maxage to use for script level pages which are configured as
  # publicly cacheable.  Used if the DCDO.public_proxy_max_age is not defined.
  DEFAULT_PUBLIC_PROXY_MAX_AGE = 3.minutes

  # Default max-age to use for script level pages which are configured as
  # publicly cacheable. Used if the DCDO.public_max_age is not defined.
  # This is set to twice the proxy max-age because of a bug in CloudFront.
  DEFAULT_PUBLIC_CLIENT_MAX_AGE = DEFAULT_PUBLIC_PROXY_MAX_AGE * 2

  before_action :disable_session_for_cached_pages

  def disable_session_for_cached_pages
    if ScriptLevelsController.cachable_request?(request)
      request.session_options[:skip] = true
    end
  end

  # Return true if request is one that can be publicly cached.
  def self.cachable_request?(request)
    script_id = request.params[:script_id]
    script = Script.get_from_cache(script_id) if script_id
    script && ScriptConfig.allows_public_caching_for_script(script.name)
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

      @redirect_path = redirect_path
      render 'levels/reset_and_redirect', formats: [:html], layout: false
    end
  end

  def next
    authorize! :read, ScriptLevel
    @script = Script.get_from_cache(params[:script_id])
    configure_caching(@script)
    redirect_to(build_script_level_path(next_script_level)) && return
  end

  def show
    authorize! :read, ScriptLevel
    @script = Script.get_from_cache(params[:script_id])

    if @script.redirect_to?
      redirect_to build_script_level_path(Script.get_from_cache(@script.redirect_to).starting_level)
      return
    end

    configure_caching(@script)
    load_script_level

    if current_user && current_user.hidden_stage?(@script_level)
      view_options(full_width: true)
      render 'levels/_hidden_stage'
      return
    end

    # In the case of the puzzle_page, send it through to be included in the
    # generation of the script level path.
    extra_params = {}
    if @script_level.long_assessment?
      if params[:puzzle_page]
        extra_params[:puzzle_page] = params[:puzzle_page]
      else
        extra_params[:puzzle_page] = 1
      end
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
  def hidden
    authorize! :read, ScriptLevel

    stage_ids = get_hidden_stage_ids(params[:script_id])

    render json: stage_ids
  end

  def toggle_hidden
    section_id = params.require(:section_id).to_i
    stage_id = params.require(:stage_id)
    # this is "true" in tests but true in non-test requests
    should_hide = params.require(:hidden) == "true" || params.require(:hidden) == true

    section = Section.find(section_id)
    authorize! :read, section

    # TODO(asher): change this to use a cache
    return head :forbidden unless Stage.find(stage_id).try(:script).try(:hideable_stages)

    hidden_stage = SectionHiddenStage.find_by(stage_id: stage_id, section_id: section_id)
    if hidden_stage && !should_hide
      hidden_stage.delete
    elsif hidden_stage.nil? && should_hide
      SectionHiddenStage.create(stage_id: stage_id, section_id: section_id)
    end

    render json: []
  end

  def stage_extras
    authorize! :read, ScriptLevel

    @stage = Script.get_from_cache(params[:script_id]).stages.select {|s| !s.lockable? && s.relative_position == params[:stage_position].to_i}.first
    render 'scripts/stage_extras'
  end

  # Provides a JSON summary of a particular stage, that is consumed by tools used to
  # build lesson plans
  def summary_for_lesson_plans
    require_levelbuilder_mode
    authorize! :read, ScriptLevel

    script = Script.get_from_cache(params[:script_id])

    if params[:stage_position]
      stage = script.stages.select {|s| !s.lockable? && s.relative_position == params[:stage_position].to_i}.first
    else
      stage = script.stages.select {|s| s.lockable? && s.relative_position == params[:lockable_stage_position].to_i}.first
    end

    render json: stage.summary_for_lesson_plans
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
    if script && ScriptConfig.allows_public_caching_for_script(script.name)
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
      current_user.next_unpassed_progression_level(@script).try(:or_next_progression_level)
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
    if params[:chapter]
      @script_level = @script.get_script_level_by_chapter(params[:chapter])
    elsif params[:stage_position]
      @script_level = @script.get_script_level_by_relative_position_and_puzzle_position(params[:stage_position], params[:id], false)
    elsif params[:lockable_stage_position]
      @script_level = @script.get_script_level_by_relative_position_and_puzzle_position(params[:lockable_stage_position], params[:id], true)
    else
      @script_level = @script.get_script_level_by_id(params[:id])
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
      @user_level = @user.user_level_for(@script_level, @level)
      level_source = @user_level.try(:level_source)
      readonly_view_options
    elsif current_user
      # load user's previous attempt at this puzzle.
      @last_activity = current_user.last_attempt(@level)
      level_source = @last_activity.try(:level_source)

      user_level = current_user.user_level_for(@script_level, @level)
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
    if user.student_of?(current_user)
      @user = user
    end
  end

  def load_section
    if params[:section_id]
      section = Section.find(params[:section_id])

      # TODO: This should use cancan/authorize.
      if section.user == current_user
        @section = section
      end
    elsif current_user.try(:sections).try(:count) == 1
      @section = current_user.sections.first
    end
  end

  def select_level
    # If there's only one level in this scriptlevel, use that
    return @script_level.levels[0] if @script_level.levels.length == 1

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

    # Otherwise return the oldest active level
    oldest_active = @script_level.oldest_active_level
    raise "No active levels found for scriptlevel #{@script_level.id}" unless oldest_active
    oldest_active
  end

  def present_level
    # All database look-ups should have already been cached by Script::script_cache_from_db
    @game = @level.game
    @stage = @script_level.stage

    load_level_source

    if @level.try(:pages)
      puzzle_page = params[:puzzle_page] || 1
      @pages = [@level.pages[puzzle_page.to_i - 1]]
      raise ActiveRecord::RecordNotFound if @pages.first.nil?
      @total_page_count = @level.pages.count
      @total_level_count = @level.levels.length
    end

    if @level.try(:peer_reviewable?)
      @peer_reviews = PeerReview.where(level: @level, submitter: current_user).where.not(status: nil)
    end

    @callback = milestone_script_level_url(
      user_id: current_user.try(:id) || 0,
      script_level_id: @script_level.id,
      level_id: @level.id
    )

    if @level.game.level_group? || @level.try(:contained_levels).present?
      @sublevel_callback = milestone_script_level_url(
        user_id: current_user.try(:id) || 0,
        script_level_id: @script_level.id,
        level_id: ''
      )
    end

    view_options(
      full_width: true,
      small_footer: @game.uses_small_footer? || @level.enable_scrolling?,
      has_i18n: @game.has_i18n?
    )

    @@fallback_responses ||= {}
    @fallback_response = @@fallback_responses[@script_level.id] ||= {
      success: milestone_response(script_level: @script_level, level: @level, solved?: true),
      failure: milestone_response(script_level: @script_level, level: @level, solved?: false)
    }
    render 'levels/show', formats: [:html]
  end

  def get_hidden_stage_ids(script_name)
    return [] unless current_user

    # If we're a teacher, we want to go through each of our sections and return
    # a mapping from section id to hidden stages in that section
    if current_user.try(:teacher?)
      sections = current_user.sections
      hidden_by_section = {}
      sections.each do |section|
        hidden_by_section[section.id] = section.section_hidden_stages.map(&:stage_id)
      end
      return hidden_by_section
    end

    # if we're a student, we want to look through each of the sections in which
    # we're a member, and use those to figure out which stages should be hidden
    # for us
    sections = current_user.sections_as_student
    return [] if sections.empty?
    script_sections = sections.select {|s| s.script.try(:name) == script_name}

    if !script_sections.empty?
      # if we have sections matching this script id, we consider a stage hidden only if it is hidden in every one
      # of the sections the student belongs to that match this script id
      all_ids = script_sections.map(&:section_hidden_stages).flatten.map(&:stage_id)
      counts = all_ids.each_with_object(Hash.new(0)) {|id, hash| hash[id] += 1}
      counts.select {|_, val| val == script_sections.length}.keys
    else
      # if we have no sections matching this script id, we consider a stage hidden if any of those sections
      # hides the stage
      sections.map(&:section_hidden_stages).flatten.map(&:stage_id).uniq
    end
  end

  # Don't try to generate the CSRF token for forms on this page because it's cached.
  def protect_against_forgery?
    return false
  end
end
