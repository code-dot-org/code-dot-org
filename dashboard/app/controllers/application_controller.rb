require 'cdo/date'
require 'dynamic_config/dcdo'
require 'dynamic_config/gatekeeper'
require 'dynamic_config/page_mode'

class ApplicationController < ActionController::Base
  include LocaleHelper
  include ApplicationHelper

#  commenting this stuff out because even if we don't have a reader configured it will set stuff in the session
# include SeamlessDatabasePool::ControllerFilter
#  use_database_pool :all => :master

  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :exception

  # this is needed to avoid devise breaking on email param
  before_filter :configure_permitted_parameters, if: :devise_controller?

  around_filter :with_locale

  before_action :fix_crawlers_with_bad_accept_headers

  def fix_crawlers_with_bad_accept_headers
    # append text/html as an acceptable response type for Edmodo and weebly-agent's malformed HTTP_ACCEPT header.

    if request.formats.include?("image/*") &&
        (request.user_agent.include?("Edmodo") || request.user_agent.include?("weebly-agent"))
      request.formats.append Mime::HTML
    end
  end

  # Configure development only filters.
  if Rails.env.development?
    # Enable or disable the rack mini-profiler if the 'pp' query string parameter is set.
    # pp='disabled' will disable it; any other value will enable it.
    before_filter :maybe_enable_profiler
    def maybe_enable_profiler
      pp = params['pp']
      if pp
        ENV['RACK_MINI_PROFILER'] = (pp == 'disabled') ? 'off' : 'on'
      end
    end

    before_filter :configure_web_console
    # Enable the Rails web console if params['dbg'] is set, or disable it
    # if params['dbg'] is 'off'.
    def configure_web_console
      if params[:dbg]
        cookies[:dbg] = (params[:dbg] != 'off') ? 'on' : nil
      end
      @use_web_console = cookies[:dbg]
    end
  end

  def reset_session_endpoint
    client_state.reset
    reset_session
    render text: 'OK <script>sessionStorage.clear()</script>'
  end

  rescue_from CanCan::AccessDenied do
    if !current_user && request.format == :html
      # we don't know who you are, you can try to sign in
      authenticate_user!
    else
      # we know who you are, you shouldn't be here
      head :forbidden
    end
  end

  # missing templates are usually a result of the user agent
  # requesting a file in the wrong format, send a 404 instead of a 500
  rescue_from ActionView::MissingTemplate do |_exception|
    render_404
  end

  def render_404
    respond_to do |format|
      format.html { render file: 'public/404.html', layout: 'layouts/application', status: :not_found }
      format.all { head :not_found }
    end
  end

  def render_500
    respond_to do |format|
      format.html { render file: 'public/500.html', layout: 'layouts/application', status: :internal_server_error }
      format.all { head :internal_server_error}
    end
  end

  def prevent_caching
    response.headers["Cache-Control"] = "no-cache, no-store, max-age=0, must-revalidate"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "Fri, 01 Jan 1990 00:00:00 GMT"
  end

  protected

  PERMITTED_USER_FIELDS = [:name, :username, :email, :password, :password_confirmation,
                           :locale, :gender, :login,
                           :remember_me, :age, :school, :full_address, :user_type,
                           :hashed_email]

  def configure_permitted_parameters
    devise_parameter_sanitizer.for(:account_update) do |u| u.permit PERMITTED_USER_FIELDS end
    devise_parameter_sanitizer.for(:sign_up) do |u| u.permit PERMITTED_USER_FIELDS end
    devise_parameter_sanitizer.for(:sign_in) do |u| u.permit PERMITTED_USER_FIELDS end
  end

  def with_locale
    I18n.with_locale(locale) do
      yield
    end
  end

  def milestone_response(options)
    response = {
      timestamp: DateTime.now.to_milliseconds
    }
    script_level = options[:script_level]

    if script_level
      response[:script_id] = script_level.script.id
      response[:level_id] = script_level.level.id

      previous_level = script_level.previous_level
      if previous_level
        response[:previous_level] = build_script_level_path(previous_level)
      end

      # if they solved it, figure out next level
      if options[:solved?]
        response[:total_lines] = options[:total_lines]
        response[:trophy_updates] = options[:trophy_updates] unless options[:trophy_updates].blank?
        response[:new_level_completed] = options[:new_level_completed]
        response[:level_path] = build_script_level_path(script_level)
        script_level_solved_response(response, script_level)
      else # not solved
        response[:message] = 'try again'
      end
    else
      response[:message] = 'no script provided'
    end

    if options[:level_source].try(:id)
      response[:level_source] = level_source_url(id: options[:level_source].id)
      response[:phone_share_url] = send_to_phone_url
      response[:level_source_id] = options[:level_source].id
    end

    if options[:share_failure]
      response[:share_failure] = options[:share_failure]
    end

    if HintViewRequest.enabled?
      if script_level && current_user
        response[:hint_view_requests] = HintViewRequest.milestone_response(script_level.script, script_level.level, current_user)
        response[:hint_view_request_url] = hint_view_requests_path
      end
    end

    if PuzzleRating.enabled?
      response[:puzzle_ratings_enabled] = script_level && PuzzleRating.can_rate?(script_level.script, script_level.level, current_user)
    end

    # logged in users can:
    if current_user
      # save solved levels to a gallery (subject to
      # additional logic in the blockly code because blockly owns
      # which levels are worth saving)
      if options[:level_source].try(:id) &&
          options[:solved?] &&
          options[:activity] &&
          options[:level_source_image]
        response[:save_to_gallery_url] = gallery_activities_path(gallery_activity: {activity_id: options[:activity].id})
      end
    end

    unless options[:solved?]
      # Call method to generate hint and related attributes, copying results into response.
      hint_details = ExperimentActivity.determine_hint({
                                                         level_source: options[:level_source],
                                                         current_user: current_user,
                                                         enable_external_hints: Rails.env.production?,
                                                         ip: request.remote_ip,
                                                         uri: request.referer,
                                                         activity: options[:activity]})
      response[:hint] = hint_details[:hint] if hint_details[:hint]
      response[:hint_request_placement] = hint_details[:hint_request_placement] if
        hint_details[:hint_request_placement]
      response[:hint_requested_url] =
        activity_hint_path(hint_details[:activity_hint]) if hint_details[:activity_hint]
    end

    # Set up the background design
    response[:design] = ExperimentActivity::TYPE_FEEDBACK_DESIGN_WHITE

    response[:activity_id] = options[:activity] && options[:activity].id

    response
  end

  def current_user
    super
  end

  def set_locale_cookie(locale)
    cookies[:language_] = { value: locale, domain: :all, expires: 10.years.from_now}
  end

  def require_levelbuilder_mode
    unless Rails.application.config.levelbuilder_mode
      raise CanCan::AccessDenied.new('Cannot create or modify levels from this environment.')
    end
  end

  def require_admin
    authorize! :read, :reports
  end
end
