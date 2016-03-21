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
    configure_caching(@script)
    load_script_level

    # In the case of the puzzle_page, send it through to be included in the
    # generation of the script level path.
    extra_params = {}
    if (params[:puzzle_page])
      extra_params[:puzzle_page] = params[:puzzle_page]
    end

    if request.path != (canonical_path = build_script_level_path(@script_level, extra_params))
      canonical_path << "?#{request.query_string}" unless request.query_string.empty?
      redirect_to canonical_path, status: :moved_permanently
      return
    end

    load_user
    return if performed?
    load_section

    return if redirect_applab_under_13(@script_level.level)

    present_level
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
    elsif params[:stage_id]
      @script_level = @script.get_script_level_by_stage_and_position(params[:stage_id], params[:id])
    else
      @script_level = @script.get_script_level_by_id(params[:id])
    end
    raise ActiveRecord::RecordNotFound unless @script_level
    authorize! :read, @script_level
  end

  def load_level_source
    if params[:solution] && @ideal_level_source = @level.ideal_level_source
      # load the solution for teachers clicking "See the Solution"
      authorize! :manage, :teacher
      level_source = @ideal_level_source
      readonly_view_options
    elsif @user && current_user && @user != current_user
      # load other user's solution for teachers viewing their students' solution
      level_source = @user.last_attempt(@level).try(:level_source)
      readonly_view_options
    elsif current_user
      # load user's previous attempt at this puzzle.
      @last_activity = current_user.last_attempt(@level)
      level_source = @last_activity.try(:level_source)

      user_level = current_user.user_level_for(@script_level)
      if user_level && user_level.submitted?
        level_view_options(submitted: true)
        level_view_options(unsubmit_url: url_for(user_level))
        readonly_view_options
      end
    end

    level_source.try(:replace_old_when_run_blocks)
    @last_attempt = level_source.try(:data)
  end

  def load_user
    return if params[:user_id].blank?

    if current_user.nil?
      render text: 'Teacher view is not available for this puzzle', layout: true
      return
    end

    user = User.find(params[:user_id])

    # TODO this should use cancan/authorize
    if user.student_of?(current_user)
      @user = user
      @user_level = @user.user_level_for(@script_level)
    end
  end

  def load_section
    if params[:section_id]
      section = Section.find(params[:section_id])

      # TODO this should use cancan/authorize
      if section.user == current_user
        @section = section
      end
    elsif current_user.try(:sections) && current_user.sections.count == 1
      @section = current_user.sections.first
    end
  end

  def present_level
    # All database look-ups should have already been cached by Script::script_cache_from_db
    @level = @script_level.level
    @game = @level.game
    @stage = @script_level.stage

    load_level_source

    @callback = milestone_url(user_id: current_user.try(:id) || 0, script_level_id: @script_level.id)

    view_options(
      full_width: true,
      small_footer: @game.uses_small_footer? || enable_scrolling?,
      has_i18n: @game.has_i18n?
    )

    @@fallback_responses ||= {}
    @fallback_response = @@fallback_responses[@script_level.id] ||= {
      success: milestone_response(script_level: @script_level, solved?: true),
      failure: milestone_response(script_level: @script_level, solved?: false)
    }
    render 'levels/show', formats: [:html]
  end

  # Don't try to generate the CSRF token for forms on this page because it's cached.
  def protect_against_forgery?
    return false
  end

end
