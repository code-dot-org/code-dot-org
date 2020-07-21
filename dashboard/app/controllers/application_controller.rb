require 'cdo/date'
require 'dynamic_config/dcdo'
require 'dynamic_config/gatekeeper'
require 'dynamic_config/page_mode'
require 'cdo/shared_constants'

class ApplicationController < ActionController::Base
  include LocaleHelper
  include ApplicationHelper

  include SeamlessDatabasePool::ControllerFilter
  # use_database_pool :all => :master

  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :exception

  # this is needed to avoid devise breaking on email param
  before_action :configure_permitted_parameters, if: :devise_controller?

  before_action :setup_i18n_tracking

  around_action :with_locale

  before_action :fix_crawlers_with_bad_accept_headers

  before_action :clear_sign_up_session_vars

  def fix_crawlers_with_bad_accept_headers
    # append text/html as an acceptable response type for Edmodo and weebly-agent's malformed HTTP_ACCEPT header.
    if request.formats.include?("image/*") &&
        (request.user_agent.include?("Edmodo") || request.user_agent.include?("weebly-agent"))
      request.formats.append Mime[:html]
    end
  end

  if CDO.rack_mini_profiler_enabled
    before_action :check_profiler
    def check_profiler
      # Authorize the mini profiler when the rack_mini_profiler_enabled setting is enabled and
      # the ?pp query param is present, and this is development or a signed-in admin user
      # in production (or another environment)
      if CDO.rack_mini_profiler_enabled && params.key?(:pp) && (Rails.env.development? || current_user&.admin?)
        Rack::MiniProfiler.authorize_request
      end
    end
  end

  # Configure development only filters.
  if Rails.env.development?
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

  rescue_from CanCan::AccessDenied do
    if !current_user && request.format == :html
      # we don't know who you are, you can try to sign in
      authenticate_user!
    elsif rack_env? :development
      raise
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
      format.html {render template: 'errors/not_found', layout: 'layouts/application', status: :not_found}
      format.all {head :not_found, content_type: 'text/html'}
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
    :email_preference_opt_in,
    :data_transfer_agreement_accepted,
    :data_transfer_agreement_required,
    :parent_email_preference_opt_in_required,
    :parent_email_preference_opt_in,
    :parent_email_preference_email,
    school_info_attributes: SCHOOL_INFO_ATTRIBUTES,
  ].freeze

  def configure_permitted_parameters
    devise_parameter_sanitizer.permit(:account_update) {|u| u.permit PERMITTED_USER_FIELDS}
    devise_parameter_sanitizer.permit(:sign_up) {|u| u.permit PERMITTED_USER_FIELDS}
    devise_parameter_sanitizer.permit(:sign_in) {|u| u.permit PERMITTED_USER_FIELDS}
  end

  # Capture the current request URL for i18n string tracking
  def setup_i18n_tracking
    Thread.current[:current_request_url] = request.url
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

    response[:phone_share_url] = send_to_phone_url

    if options[:level_source].try(:id)
      response[:level_source] = level_source_url(id: options[:level_source].id)
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

    response[:activity_id] = options[:activity] && options[:activity].id

    response
  end

  def current_user
    super
  end

  def set_locale_cookie(locale)
    cookies[:language_] = {value: locale, domain: :all, expires: 10.years.from_now}
  end

  def require_english_in_levelbuilder_mode
    redirect_to '/', flash: {alert: 'Editing on levelbuilder is only supported in English (en-US locale).'} unless locale == :'en-US'
  end

  def require_levelbuilder_mode
    require_english_in_levelbuilder_mode

    unless Rails.application.config.levelbuilder_mode
      raise CanCan::AccessDenied.new('Cannot create or modify levels from this environment.')
    end
  end

  # Allow us to get some UI test coverage on levelbuilder-only features. This
  # protection must be applied carefully to make sure that script and level
  # files in the test environment are never modified.
  #
  # UI test authors must be careful to clean up after themselves so that they do
  # not modify curriculum content in a way could introduce intermittent failures
  # in other tests. Developers wishing to run these tests locally should run
  # their local server in levelbuilder_mode.
  def require_levelbuilder_mode_or_test_env
    require_english_in_levelbuilder_mode

    unless Rails.application.config.levelbuilder_mode || rack_env?(:test)
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
    if pairings_from_params[:pairings].blank?
      session[:pairings] = []
      session[:pairing_section_id] = nil
      return
    end

    # replace pairings
    session[:pairings] = pairings_from_params[:pairings].map do |pairing_param|
      other_user = User.find(pairing_param[:id])
      if current_user.can_pair_with? other_user
        other_user.id
      else
        # TODO: should this cause an error to be returned to the user?
        nil
      end
    end.compact

    session[:pairing_section_id] = pairings_from_params[:section_id].to_i
  end

  def pairings
    return [] if session[:pairings].blank?
    if pairing_still_enabled
      User.find(session[:pairings])
    else
      # clear the pairing data from the session cookie
      self.pairings = {pairings: []}
      return []
    end
  end

  # @return [Array of Integers] an array of user IDs of users paired with the
  #   current user.
  def pairing_user_ids
    unless pairing_still_enabled
      # clear the pairing data from the session cookie
      self.pairings = {pairings: []}
    end

    # TODO(asher): Determine whether we need to guard against it being nil.
    session[:pairings].nil? ? [] : session[:pairings]
  end

  def clear_sign_up_session_vars
    if session[:sign_up_uid] || session[:sign_up_type] || session[:sign_up_tracking_expiration]
      session.delete(:sign_up_uid)
      session.delete(:sign_up_type)
      session.delete(:sign_up_tracking_expiration)
    end
  end

  private

  def pairing_still_enabled
    session[:pairing_section_id] && Section.find(session[:pairing_section_id]).pairing_allowed
  end
end
