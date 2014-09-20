class ApplicationController < ActionController::Base
  include LocaleHelper
  include ApplicationHelper

  include SeamlessDatabasePool::ControllerFilter
  use_database_pool :all => :master

  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :exception

  # this is needed to avoid devise breaking on email param
  before_filter :configure_permitted_parameters, if: :devise_controller?
  before_filter :verify_params_before_cancan_loads_model

  around_filter :with_locale

  before_action :fix_crawlers_with_bad_accept_headers

  def fix_crawlers_with_bad_accept_headers
    # append text/html as an acceptable response type for Edmodo and weebly-agent's malformed HTTP_ACCEPT header.

    if request.formats.include?("image/*") &&
        (request.user_agent.include?("Edmodo") || request.user_agent.include?("weebly-agent"))
      request.formats.append Mime::HTML
    end
  end

  def reset_session_endpoint
    reset_session
    render text: "OK"
  end

# we need the following to fix a problem with the interaction between CanCan and strong_parameters
# https://github.com/ryanb/cancan/issues/835
  def verify_params_before_cancan_loads_model
    resource = controller_name.singularize.to_sym
    method = "#{resource}_params"
    params[resource] &&= send(method) if respond_to?(method, true)
  end

  # when CanCan denies access, send a 403 Forbidden response instead of causing a server error
  rescue_from CanCan::AccessDenied do
    head :forbidden
    # TODO if users are actually seeing this (eg. because they cleared
    # cookies and clicked on something), maybe we should render an
    # actual page
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
    response = {}
    script_level = options[:script_level]

    if script_level
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

    if options[:level_source]
      response[:level_source] = level_source_url(options[:level_source])
      response[:phone_share_url] = send_to_phone_url
      response[:level_source_id] = options[:level_source].id
    end

    # logged in users can save solved levels to a gallery (subject to
    # additional logic in the blockly code because blockly owns
    # which levels are worth saving)
    if current_user && options[:level_source] && options[:solved?] && options[:activity]
      response[:save_to_gallery_url] = gallery_activities_path(gallery_activity: {activity_id: options[:activity].id})
    end

    unless options[:solved?]
      # Call method to generate hint and related attributes, copying results into response.
      hint_details = ExperimentActivity::determine_hint({
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

    response
  end

  def current_user
    if Rails.configuration.minimal_mode
      nil
    else
      super
    end
  end

  def nonminimal
    if Rails.configuration.minimal_mode
      render 'shared/overloaded', status: 502, formats: [:html]
    end
  end

  def set_locale_cookie(locale)
    cookies[:language_] = { value: locale, domain: :all }
  end
end
