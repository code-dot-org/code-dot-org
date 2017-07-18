require 'cdo/date'
require 'dynamic_config/dcdo'
require 'dynamic_config/gatekeeper'
require 'dynamic_config/page_mode'
require 'cdo/shared_constants'

class ApplicationController < ActionController::Base
  include LocaleHelper
  include ApplicationHelper

  # Commenting this stuff out because even if we don't have a reader configured
  # it will set stuff in the session.
  # include SeamlessDatabasePool::ControllerFilter
  # use_database_pool :all => :master

  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :exception

  # this is needed to avoid devise breaking on email param
  before_action :configure_permitted_parameters, if: :devise_controller?

  around_action :with_locale

  before_action :fix_crawlers_with_bad_accept_headers

  def fix_crawlers_with_bad_accept_headers
    # append text/html as an acceptable response type for Edmodo and weebly-agent's malformed HTTP_ACCEPT header.
    if request.formats.include?("image/*") &&
        (request.user_agent.include?("Edmodo") || request.user_agent.include?("weebly-agent"))
      request.formats.append Mime[:html]
    end
  end

  # Configure development only filters.
  if Rails.env.development?
    # Enable or disable the rack mini-profiler if the 'pp' query string parameter is set.
    # pp='disabled' will disable it; any other value will enable it.
    before_action :maybe_enable_profiler
    def maybe_enable_profiler
      pp = params['pp']
      if pp
        ENV['RACK_MINI_PROFILER'] = (pp == 'disabled') ? 'off' : 'on'
      end
    end

    before_action :configure_web_console
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
    sign_out if current_user
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
  rescue_from ActionView::MissingTemplate do |exception|
    Rails.logger.warn("Missing template: #{exception}")
    render_404
  end

  def render_404
    respond_to do |format|
      format.html {render file: 'public/404.html', layout: 'layouts/application', status: :not_found}
      format.all {head :not_found}
    end
  end

  def render_500
    respond_to do |format|
      format.html {render file: 'public/500.html', layout: 'layouts/application', status: :internal_server_error}
      format.all {head :internal_server_error}
    end
  end

  def prevent_caching
    response.headers["Cache-Control"] = "no-cache, no-store, max-age=0, must-revalidate"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "Fri, 01 Jan 1990 00:00:00 GMT"
  end

  protected

  # These are sometimes updated from the registration form
  SCHOOL_INFO_ATTRIBUTES = [
    :country,
    :school_type,
    :school_state,
    :school_district_id,
    :school_district_name,
    :school_id,
    :school_name,
    :school_zip,
    :full_address,
    :school_district_other,
    :school_name_other
  ].freeze

  PERMITTED_USER_FIELDS = [
    :name,
    :username,
    :email,
    :password,
    :password_confirmation,
    :locale,
    :gender,
    :login,
    :remember_me,
    :age, :school,
    :full_address,
    :user_type,
    :hashed_email,
    :terms_of_service_version,
    school_info_attributes: SCHOOL_INFO_ATTRIBUTES
  ].freeze

  def configure_permitted_parameters
    devise_parameter_sanitizer.permit(:account_update) {|u| u.permit PERMITTED_USER_FIELDS}
    devise_parameter_sanitizer.permit(:sign_up) {|u| u.permit PERMITTED_USER_FIELDS}
    devise_parameter_sanitizer.permit(:sign_in) {|u| u.permit PERMITTED_USER_FIELDS}
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
    level = options[:level]

    if script_level
      response[:script_id] = script_level.script.id
      response[:level_id] = level.id

      # if they solved it, figure out next level
      if options[:solved?]
        response[:total_lines] = options[:total_lines]
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
      response[:share_failure] = response_for_share_failure(options[:share_failure])
    end

    if HintViewRequest.enabled?
      if script_level && current_user
        response[:hint_view_requests] = HintViewRequest.milestone_response(script_level.script, level, current_user)
        response[:hint_view_request_url] = hint_view_requests_path
      end
    end

    if PuzzleRating.enabled?
      response[:puzzle_ratings_enabled] = script_level && PuzzleRating.can_rate?(script_level.script, level, current_user)
    end

    # logged in users can:
    if current_user
      # save solved levels to a gallery (subject to
      # additional logic in the blockly code because blockly owns
      # which levels are worth saving)
      if options[:level_source].try(:id) &&
          options[:solved?] &&
          options[:level_source_image]
        response[:save_to_gallery_url] = gallery_activities_path(
          gallery_activity: {
            level_source_id: options[:level_source].try(:id),
            user_level_id: options[:user_level] && options[:user_level].id
          }
        )
      end
    end

    response[:activity_id] = options[:activity] && options[:activity].id

    response
  end

  def current_user
    super
  end

  def set_locale_cookie(locale)
    cookies[:language_] = {value: locale, domain: :all, expires: 10.years.from_now}
  end

  def require_levelbuilder_mode
    unless Rails.application.config.levelbuilder_mode
      raise CanCan::AccessDenied.new('Cannot create or modify levels from this environment.')
    end
  end

  def require_admin
    authorize! :read, :reports
  end

  # Pairings are stored as an array of user ids in the session
  # (storing full objects is not a good idea because the session is
  # saved as a cookie)

  def pairings=(pairings_from_params)
    # remove pairings
    if pairings_from_params.blank?
      session[:pairings] = []
      return
    end

    # replace pairings
    session[:pairings] = pairings_from_params.map do |pairing_param|
      other_user = User.find(pairing_param[:id])
      if current_user.can_pair_with? other_user
        other_user.id
      else
        # TODO: should this cause an error to be returned to the user?
        nil
      end
    end.compact
  end

  def pairings
    return [] if session[:pairings].blank?

    User.find(session[:pairings])
  end

  # @return [Array of Integers] an array of user IDs of users paired with the
  #   current user.
  def pairing_user_ids
    # TODO(asher): Determine whether we need to guard against it being nil.
    session[:pairings].nil? ? [] : session[:pairings]
  end
end
