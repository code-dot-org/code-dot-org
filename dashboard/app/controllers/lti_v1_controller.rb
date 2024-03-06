require "base64"
require "queries/lti"
require "services/lti"
require "policies/lti"
require "concerns/partial_registration"
require "clients/lti_advantage_client"
require "cdo/honeybadger"

class LtiV1Controller < ApplicationController
  before_action -> {redirect_to lti_v1_integrations_path, alert: I18n.t('lti.integration.early_access.closed')},
                if: -> {Policies::Lti.early_access_closed?}, only: :create_integration

  # Don't require an authenticity token because LTI Platforms POST to this
  # controller.
  skip_before_action :verify_authenticity_token

  # [GET/POST] /lti/v1/login(/:platform_id)
  #
  # Most LTI Platforms should send a client_id as part of the login request.
  # However, it is not required per the LTI 1.3 spec. In these cases, we can
  # supply clients with a unique login URL (with a platform_id), so we can
  # identify the caller's identity. The requst will always contain the iss param,
  # as required by the LTI 1.3 standard
  # https://www.imsglobal.org/spec/security/v1p0/#step-1-third-party-initiated-login
  def login
    if params[:client_id]
      query_params = {client_id: params[:client_id], issuer: params[:iss]}
    elsif params[:platform_id]
      query_params = {platform_id: params[:platform_id]}
    else
      return log_unauthorized(
        'Missing required parameters for LTI authentication',
        {
          client_id: params[:client_id],
          issuer: params[:iss],
          platform_id: params[:platform_id],
        }
      )
    end

    lti_integration = LtiIntegration.find_by(query_params)
    return log_unauthorized('LTI integration not found', query_params) unless lti_integration

    state_and_nonce = create_state_and_nonce
    # set cache key as state value, since we get this back in the final response
    # from the LTI Platform, and can use it to query for these values in the
    # authenticate controller action.
    begin
      write_cache(state_and_nonce[:state], state_and_nonce)
    rescue => exception
      Honeybadger.notify(exception, context: {message: 'Error writing state and nonce to cache'})
      return render status: :internal_server_error
    end

    auth_redirect_url = URI(lti_integration[:auth_redirect_url])
    auth_redirect_url.query = {
      scope: 'openid',
      response_type: 'id_token',
      client_id: lti_integration[:client_id],
      redirect_uri: CDO.studio_url('/lti/v1/authenticate', CDO.default_scheme),
      login_hint:  params[:login_hint],
      lti_message_hint: params[:lti_message_hint].to_s, # Required by Canvas
      state: state_and_nonce[:state],
      response_mode: 'form_post',
      nonce: state_and_nonce[:nonce],
      prompt: 'none',
    }.to_query

    redirect_to auth_redirect_url.to_s
  end

  def authenticate
    unless params[:open_in_new_tab]
      id_token = params[:id_token]
      state = params[:state]
      token_hash = {id_token: id_token, state: state}
      # url = "#{lti_v1_iframe_url}?#{token_hash.to_query}"
      redirect_to "#{lti_v1_iframe_url}?#{token_hash.to_query}"
      return
    end
    id_token = params[:id_token]
    return log_unauthorized('Missing LTI ID token') unless id_token
    begin
      decoded_jwt_no_auth = JSON::JWT.decode(id_token, :skip_verification)
    rescue => exception
      return log_unauthorized(exception)
    end
    # client_id is the aud[ience] in the JWT
    extracted_client_id = decoded_jwt_no_auth[:aud]
    extracted_issuer_id = decoded_jwt_no_auth[:iss]

    integration = LtiIntegration.find_by({client_id: extracted_client_id, issuer: extracted_issuer_id})
    if integration.nil?
      return log_unauthorized('LTI integration not found', {client_id: extracted_client_id, issuer: extracted_issuer_id})
    end

    # check state and nonce in response and id_token against cached values
    begin
      cached_state_and_nonce = read_cache params[:state]
    rescue => exception
      Honeybadger.notify(exception, context: {message: 'Error reading state and nonce from cache'})
      return render status: :internal_server_error
    end
    if (params[:state] != cached_state_and_nonce[:state]) || (decoded_jwt_no_auth[:nonce] != cached_state_and_nonce[:nonce])
      return log_unauthorized(
        'State or nonce mismatch in LTI JWT auth',
        {
          state: params[:state],
          nonce: decoded_jwt_no_auth[:nonce],
          cached_state: cached_state_and_nonce[:state],
          cached_nonce: cached_state_and_nonce[:nonce],
        }
      )
    end

    begin
      # verify the jwt via the integration's public keyset
      decoded_jwt = get_decoded_jwt(integration, id_token)
    rescue => exception
      return log_unauthorized(exception)
    end

    jwt_verifier = JwtVerifier.new(decoded_jwt, integration)

    if jwt_verifier.verify_jwt
      message_type = decoded_jwt[:'https://purl.imsglobal.org/spec/lti/claim/message_type']
      return wrong_resource_type unless message_type == 'LtiResourceLinkRequest'

      user = Queries::Lti.get_user(decoded_jwt)
      target_link_uri = decoded_jwt[:'https://purl.imsglobal.org/spec/lti/claim/target_link_uri']

      launch_context = decoded_jwt[Policies::Lti::LTI_CONTEXT_CLAIM]
      nrps_url = decoded_jwt[Policies::Lti::LTI_NRPS_CLAIM][:context_memberships_url]
      resource_link_id = decoded_jwt[Policies::Lti::LTI_RESOURCE_LINK_CLAIM][:id]
      deployment_id = decoded_jwt[Policies::Lti::LTI_DEPLOYMENT_ID_CLAIM]
      deployment = Queries::Lti.get_deployment(integration.id, deployment_id)
      lti_account_type = Policies::Lti.get_account_type(decoded_jwt[Policies::Lti::LTI_ROLES_KEY])

      if deployment.nil?
        deployment = Services::Lti.create_lti_deployment(integration.id, deployment_id)
      end
      redirect_params = {
        lti_integration_id: integration.id,
        deployment_id: deployment.id,
        context_id: launch_context[:id],
        rlid: resource_link_id,
        nrps_url: nrps_url,
      }

      destination_url = "#{target_link_uri}?#{redirect_params.to_query}"

      if user
        sign_in user

        # If on code.org, the user is a student and the LTI has the same user as a teacher, upgrade the student to a teacher.
        if lti_account_type == User::TYPE_TEACHER && user.user_type == User::TYPE_STUDENT
          @form_data = {
            email: Services::Lti.get_claim(decoded_jwt, :email),
            destination_url: destination_url
          }

          render 'lti/v1/upgrade_account' and return
        end

        redirect_to destination_url
      else
        user = Services::Lti.initialize_lti_user(decoded_jwt)
        PartialRegistration.persist_attributes(session, user)
        session[:user_return_to] = "#{target_link_uri}?#{redirect_params.to_query}"
        redirect_to new_user_registration_url
      end
    else
      jwt_error_message = jwt_verifier.errors.empty? ? 'Invalid JWT' : jwt_verifier.errors.join(', ')
      return log_unauthorized('Invalid JWT', {errors: jwt_error_message})
    end
  end

  def get_decoded_jwt(integration, id_token)
    public_jwk_url = integration.jwks_url
    response = JSON.parse(HTTParty.get(public_jwk_url).body)
    jwk_set = JSON::JWK::Set.new response
    JSON::JWT.decode(id_token, jwk_set)
  end

  def render_sync_course_error(message, status)
    @lti_section_sync_result = {error: message}
    Honeybadger.notify(
      'LTI roster sync error',
      context: {
        reason: message,
      }
    )
    return respond_to do |format|
      format.html do
        render lti_v1_sync_course_path, status: status
      end
      format.json {render json: @lti_section_sync_result, status: status}
    end
  end

  # GET /lti/v1/iframe
  # Detects if LMS is trying open Code.org in an iframe, prompt user to open in
  # new tab. Non-iframe experience is opaq to user
  def iframe
    render html: <<~HTML.html_safe, layout: false
      <!DOCTYPE html>
      <html lang="en">
      <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Opening Code.org in New Tab</title>
      <script>
        window.onload = function() {
          // Get the current URL
          const fullUrl = `${window.location.protocol}//${window.location.host}/lti/v1/authenticate`;
          const urlParams = new URLSearchParams(window.location.search);
          const idTokenParam = `id_token=${urlParams.get('id_token')}`;
          const stateParam = `state=${urlParams.get('state')}`;
          var newTabParam = "open_in_new_tab=true";

          // Append the new query parameter appropriately
          const auth_url = `${fullUrl}?${idTokenParam}&${stateParam}&${newTabParam}`
          // Check if the current window is the top-level window
          if (window.location !== window.parent.location) {
            // Create a div to hold the message and button
            var messageDiv = document.createElement("div");
            messageDiv.style.position = "fixed";
            messageDiv.style.left = "0";
            messageDiv.style.top = "0";
            messageDiv.style.width = "100%";
            messageDiv.style.height = "100%";
            messageDiv.style.backgroundColor = "white";
            messageDiv.style.zIndex = "10000";
            messageDiv.style.display = "flex";
            messageDiv.style.justifyContent = "center";
            messageDiv.style.alignItems = "center";
            messageDiv.style.flexDirection = "column";
            messageDiv.style.textAlign = "center";
            messageDiv.innerHTML = `
              <p>Code.org cannot be run in an embeded window. Please open it in a new tab.</p>
              <button onclick="openInNewTab()">Open in New Tab</button>
            `;

            // Function to open the current URL in a new tab
            window.openInNewTab = function(url) {
              // Open the new URL in a new tab
              window.open(auth_url, '_blank');
            };
            // Append the message div to the body
            document.body.appendChild(messageDiv);
          } else {
            // Redirect to auth_url endpoint
            window.location.replace(auth_url);
          }
        };
      </script>
      </head>
      <body>
      </body>
      </html>
    HTML
  end

  # GET /lti/v1/sync_course
  # Syncs an LMS course from an LTI launch or from the teacher dashboard sync button.
  # It can respond to either HTML or JSON content requests.
  def sync_course
    return unauthorized_status unless current_user
    unless Policies::Lti.roster_sync_enabled?(current_user)
      return redirect_to home_path
    end
    params.require([:lti_integration_id, :deployment_id, :context_id, :rlid, :nrps_url]) if params[:section_code].blank?

    lti_course, lti_integration, deployment_id, context_id, resource_link_id, nrps_url = nil
    if params[:section_code].present?
      # Section code present, meaning this is a sync from the teacher dashboard.
      # Populate vars from the section associated with the input code.
      lti_course = Queries::Lti.get_lti_course_from_section_code(params[:section_code])
      unless lti_course
        return render_sync_course_error('We couldn\'t find the given section.', :bad_request)
      end
      lti_integration = lti_course.lti_integration
      deployment_id = lti_course.lti_deployment_id
      context_id = lti_course.context_id
      resource_link_id = lti_course.resource_link_id
      nrps_url = lti_course.nrps_url
    else
      # Section code isn't present, meaning this is a sync from an LTI launch.
      # Populate vars from the request params.
      begin
        lti_integration = LtiIntegration.find(params[:lti_integration_id])
      rescue
        return render_sync_course_error('LTI Integration not found', :bad_request)
      end
      deployment_id = params[:deployment_id]
      context_id = params[:context_id]
      resource_link_id = params[:rlid]
      nrps_url = params[:nrps_url]
    end

    result = {
      all: {},
      changed: {}
    }

    had_changes = false
    ActiveRecord::Base.transaction do
      lti_course ||= Queries::Lti.find_or_create_lti_course(
        lti_integration_id: lti_integration.id,
        context_id: context_id,
        deployment_id: deployment_id,
        nrps_url: nrps_url,
        resource_link_id: resource_link_id
      )

      lti_advantage_client = LtiAdvantageClient.new(lti_integration.client_id, lti_integration.issuer)
      nrps_response = lti_advantage_client.get_context_membership(nrps_url, resource_link_id)
      nrps_sections = Services::Lti.parse_nrps_response(nrps_response, lti_integration.issuer)

      sync_course_roster_results = Services::Lti.sync_course_roster(lti_integration: lti_integration, lti_course: lti_course, nrps_sections: nrps_sections, section_owner_id: current_user.id)
      had_changes ||= sync_course_roster_results

      # Report which sections were updated
      nrps_sections.each do |section_id, section|
        result[:all][section_id] = {
          name: section[:name],
          size: section[:members].size,
        }
      end
    end

    @lti_section_sync_result = result

    respond_to do |format|
      format.html do
        if had_changes || params[:force]
          render lti_v1_sync_course_path
        else
          redirect_to home_path
        end
      end
      format.json {render json: result}
    end
  end

  # POST /lti/v1/integrations
  # Creates a new LtiIntegration
  def create_integration
    begin
      params.require([:name, :client_id, :lms, :email])
    rescue
      flash.alert = I18n.t('lti.error.missing_params')
      return redirect_to lti_v1_integrations_path
    end

    integration_name = params[:name]
    client_id = params[:client_id]
    platform_name = params[:lms]
    admin_email = params[:email]

    unless Policies::Lti::LMS_PLATFORMS.key?(platform_name.to_sym)
      flash.alert = I18n.t('lti.error.unsupported_lms_type')
      return redirect_to lti_v1_integrations_path
    end

    platform_urls = Policies::Lti::LMS_PLATFORMS[platform_name.to_sym]
    issuer = platform_urls[:issuer]
    auth_redirect_url = platform_urls[:auth_redirect_url]
    jwks_url = platform_urls[:jwks_url]
    access_token_url = platform_urls[:access_token_url]

    existing_integration = Queries::Lti.get_lti_integration(issuer, client_id)
    @integration_status = nil

    if existing_integration.nil?
      Services::Lti.create_lti_integration(
        name: integration_name,
        client_id: client_id,
        issuer: issuer,
        platform_name: platform_name,
        auth_redirect_url: auth_redirect_url,
        jwks_url: jwks_url,
        access_token_url: access_token_url,
        admin_email: admin_email
      )

      @integration_status = :created
      LtiMailer.lti_integration_confirmation(admin_email).deliver_now
    end
    render 'lti/v1/integration_status'
  end

  # GET /lti/v1/integrations
  # Displays the onboarding portal for creating a new LTI Integration
  def new_integration
    @form_data = {}
    @form_data[:lms_platforms] = Policies::Lti::LMS_PLATFORMS.map do |key, value|
      {platform: key, name: value[:name]}
    end

    render template: Policies::Lti.early_access? ? 'lti/v1/integrations/early_access' : 'lti/v1/integrations'
  end

  # POST /lti/v1/upgrade_account
  def confirm_upgrade_account
    return unauthorized_status unless current_user

    begin
      params.require([:email])
    rescue
      render(status: :bad_request, json: {error: I18n.t('lti.upgrade_to_teacher_account.error.missing_email')}) and return
    end

    current_user.upgrade_to_teacher(params[:email])
    render status: :ok, json: {}
  end

  private

  NAMESPACE = 'lti_v1_controller'.freeze

  def unauthorized_status
    render(status: :unauthorized, json: {error: 'Unauthorized'})
  end

  def wrong_resource_type
    render(status: :not_acceptable, json: {error: I18n.t('lti.error.wrong_resource_type')})
  end

  def create_state_and_nonce
    state = generate_random_string 10
    nonce = Digest::SHA2.hexdigest(generate_random_string(10))

    {state: state, nonce: nonce}
  end

  def write_cache(key, value)
    # TODO: Add error handling
    CDO.shared_cache.write("#{NAMESPACE}/#{key}", value.to_json, expires_in: 1.minute)
  end

  def read_cache(key)
    # TODO: Add error handling
    json_value = CDO.shared_cache.read("#{NAMESPACE}/#{key}")
    JSON.parse(json_value).symbolize_keys
  end

  def generate_random_string(length)
    SecureRandom.alphanumeric length
  end

  def log_unauthorized(exception, context = nil)
    Honeybadger.notify(
      exception,
      context: context
    )
    unauthorized_status
  end
end
