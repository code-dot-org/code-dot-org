class LtiV1Controller < ApplicationController
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
    id_token = params[:id_token]
    return log_unauthorized('Missing LTI ID token') unless id_token
    begin
      decoded_jwt_no_auth = JSON::JWT.decode(id_token, :skip_verification)
    rescue => exception
      return log_unauthorized(exception)
    end
    # client_id is the aud[ience] in the JWT, it can be a string or an array
    extracted_client_id = decoded_jwt_no_auth[:aud].is_a?(Array) ? decoded_jwt_no_auth[:aud].first : decoded_jwt_no_auth[:aud]
    extracted_issuer_id = decoded_jwt_no_auth[:iss]

    return log_unauthorized('Missing "aud" or "iss" from ID token') unless extracted_client_id.present? && extracted_issuer_id.present?
    # set cache key
    integration_cache_key = "#{extracted_issuer_id}/#{extracted_client_id}"
    # 'integration' can come back as a hash from the cache or as a class instance returned by ActiveRecord. In the case of the former, we are
    # unable to access values using dot notation and instead must use brackets. This still works with the value returned by Active Record,
    # as it has a '[]' method that behaves in the same way https://api.rubyonrails.org/classes/ActiveRecord/AttributeMethods.html#method-i-5B-5D
    integration = read_cache(integration_cache_key) || LtiIntegration.find_by({client_id: extracted_client_id, issuer: extracted_issuer_id})
    return log_unauthorized('LTI integration not found', {client_id: extracted_client_id, issuer: extracted_issuer_id}) unless integration
    # Cache integration for fast retrieval on subsequent LTI launches. Set
    # expires_in to 1 week
    write_cache(integration_cache_key, integration, 1.week)

    # check state and nonce in response and id_token against cached values
    begin
      cached_state_and_nonce = read_cache params[:state]
    rescue => exception
      Honeybadger.notify(exception, context: {message: 'Error reading state and nonce from cache'})
      return render status: :internal_server_error
    end
    if cached_state_and_nonce.nil? || (params[:state] != cached_state_and_nonce[:state]) || (decoded_jwt_no_auth[:nonce] != cached_state_and_nonce[:nonce])
      return log_unauthorized(
        'State or nonce mismatch in LTI JWT auth',
        {
          state: params[:state],
          nonce: decoded_jwt_no_auth[:nonce],
          cached_state: cached_state_and_nonce&.[](:state),
          cached_nonce: cached_state_and_nonce&.[](:nonce),
        }
      )
    end

    begin
      # verify the jwt via the integration's public keyset
      decoded_jwt = get_decoded_jwt(integration, id_token)
    rescue => exception
      return log_unauthorized(exception)
    end

    # Schoology has multiple contexts that will launch LTI tools in an iframe.
    # In this case, we will redirect to the iframe route, to prompt user to open
    # in a new tab. This flow appends a 'new_tab=true' query param, so it will
    # pass this block once the iframe "jail break" has happened.
    if Policies::Lti.force_iframe_launch?(decoded_jwt[:iss]) && !params[:new_tab]
      auth_url_base = CDO.studio_url('/lti/v1/authenticate', CDO.default_scheme)

      query_params = {
        id_token: params[:id_token],
        state: params[:state],
        new_tab: "true",
      }

      @auth_url = "#{auth_url_base}?#{query_params.to_query}"
      render 'lti/v1/iframe', layout: false and return
    end

    jwt_verifier = JwtVerifier.new(decoded_jwt, integration)

    if jwt_verifier.verify_jwt
      message_type = decoded_jwt[Policies::Lti::MessageType::CLAIM]
      if Policies::Lti::MessageType::SUPPORTED.exclude?(message_type)
        return render status: :not_acceptable, template: 'lti/v1/authenticate/unsupported_message_type', locals: {
          message_type: message_type,
        }
      end

      user = Queries::Lti.get_user(decoded_jwt)
      target_link_uri = decoded_jwt[:'https://purl.imsglobal.org/spec/lti/claim/target_link_uri']
      launch_context = decoded_jwt[Policies::Lti::LTI_CONTEXT_CLAIM]
      nrps_url = decoded_jwt[Policies::Lti::LTI_NRPS_CLAIM]&.[](:context_memberships_url)
      resource_link_id = decoded_jwt[Policies::Lti::LTI_RESOURCE_LINK_CLAIM]&.[](:id)
      deployment_id = decoded_jwt[Policies::Lti::LTI_DEPLOYMENT_ID_CLAIM]
      deployment = Queries::Lti.get_deployment(integration[:id], deployment_id)
      lti_account_type = Policies::Lti.get_account_type(decoded_jwt[Policies::Lti::LTI_ROLES_KEY])

      if deployment.nil?
        deployment = Services::Lti.create_lti_deployment(integration[:id], deployment_id)
      end
      redirect_params = {
        lti_integration_id: integration[:id],
        deployment_id: deployment.id,
        context_id: launch_context&.[](:id),
        rlid: resource_link_id,
        nrps_url: nrps_url,
      }

      destination_url = "#{target_link_uri}?#{redirect_params.to_query}"
      session[:user_return_to] = destination_url

      if user
        sign_in user

        metadata = {
          'user_type' => user.user_type,
          'lms_name' => integration[:platform_name],
        }
        Metrics::Events.log_event(
          user: user,
          event_name: 'lti_user_signin',
          metadata: metadata,
        )

        # If this is the user's first login, send them into the account linking flow
        unless user.lms_landing_opted_out
          Services::Lti.initialize_lms_landing_session(session, integration[:platform_name], 'continue', user.user_type)
          PartialRegistration.persist_attributes(session, user)
          publish_linking_page_visit(user, integration[:platform_name])
          render 'lti/v1/account_linking/landing', locals: {email: Services::Lti.get_claim(decoded_jwt, :email)} and return
        end

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
        # PartialRegistration removes the email address, so store it in a local variable first
        email_address = Services::Lti.get_claim(decoded_jwt, :email)
        Services::Lti.initialize_lms_landing_session(session, integration[:platform_name], 'new', user.user_type)
        PartialRegistration.persist_attributes(session, user)
        publish_linking_page_visit(user, integration[:platform_name])
        render 'lti/v1/account_linking/landing', locals: {email: email_address} and return
      end
    else
      jwt_error_message = jwt_verifier.errors.empty? ? 'Invalid JWT' : jwt_verifier.errors.join(', ')
      return log_unauthorized('Invalid JWT', {errors: jwt_error_message})
    end
  end

  def get_decoded_jwt(integration, id_token)
    public_jwk_url = integration[:jwks_url]
    response = JSON.parse(HTTParty.get(public_jwk_url).body)
    jwk_set = JSON::JWK::Set.new response
    JSON::JWT.decode(id_token, jwk_set)
  end

  def render_sync_course_error(reason, status, error = nil, message: nil)
    @lti_section_sync_result = {error: error, message: message}
    Honeybadger.notify(
      'LTI roster sync error',
      context: {
        reason: reason,
        details: message,
      }
    )
    return respond_to do |format|
      format.html do
        render lti_v1_sync_course_path, status: status
      end
      format.json {render json: @lti_section_sync_result, status: status}
    end
  end

  # GET /lti/v1/sync_course
  # Syncs an LMS course from an LTI launch or from the teacher dashboard sync button.
  # It can respond to either HTML or JSON content requests.
  def sync_course
    return unauthorized_status unless current_user
    unless Policies::Lti.roster_sync_enabled?(current_user)
      return redirect_to home_path
    end

    if params[:section_code].blank?
      begin
        params.require([:lti_integration_id, :deployment_id, :context_id, :rlid, :nrps_url])
      rescue ActionController::ParameterMissing => exception
        case exception.param
        when :context_id, :nrps_url
          return render_sync_course_error('Attempting to sync a course or section from the wrong place.', :bad_request, 'wrong_context')
        when :lti_integration_id, :deployment_id, :rlid
          return render_sync_course_error("Missing #{exception.param}.", :bad_request, 'missing_param')
        end
      end
    end

    lti_course, lti_integration, deployment_id, context_id,  nrps_url = nil
    resource_link_id = params[:rlid]

    if params[:section_code].present?
      # Section code present, meaning this is a sync from the teacher dashboard.
      # Populate vars from the section associated with the input code.
      lti_course = Queries::Lti.get_lti_course_from_section_code(params[:section_code])
      unless lti_course
        return render_sync_course_error('We couldn\'t find the given section.', :bad_request, 'no_section')
      end
      lti_integration = lti_course.lti_integration
      deployment_id = lti_course.lti_deployment_id
      context_id = lti_course.context_id
      nrps_url = lti_course.nrps_url
      # Prefer the resource link from the SSO parameter instead of the course one. The resource link could have changed.
      # For example, the teacher could have had Code.org in one material/module but deleted that material/module and
      # made a new one (deleted the old LtiResourceLink and created a brand new one). This results in a mismatch between
      # what is stored on Code.org's LtiCourse. Therefore, when doing an SSO sync, prefer the latest RLID and update our
      # records with that.
      resource_link_id ||= lti_course.resource_link_id
    else
      # Section code isn't present, meaning this is a sync from an LTI launch.
      # Populate vars from the request params.
      begin
        lti_integration = LtiIntegration.find(params[:lti_integration_id])
      rescue
        return render_sync_course_error('LTI Integration not found', :bad_request, 'no_integration')
      end
      deployment_id = params[:deployment_id]
      context_id = params[:context_id]
      nrps_url = params[:nrps_url]
    end

    lti_advantage_client = LtiAdvantageClient.new(lti_integration.client_id, lti_integration.issuer)
    nrps_response = lti_advantage_client.get_context_membership(nrps_url, resource_link_id)
    if Policies::Lti.issuer_accepts_resource_link?(lti_integration.issuer)
      nrps_response_errors = Services::Lti::NRPSResponseValidator.call(nrps_response)

      if nrps_response_errors.present?
        return render_sync_course_error(
          'Invalid LTI key configuration',
          :unprocessable_entity,
          'invalid_configs',
          message: nrps_response_errors.join("\n")
        )
      end
    end
    nrps_sections = Services::Lti.parse_nrps_response(nrps_response, lti_integration.issuer)

    result = nil
    had_changes = false
    total_sections = 0
    total_students = 0
    ActiveRecord::Base.transaction do
      lti_course ||= Queries::Lti.find_or_create_lti_course(
        lti_integration_id: lti_integration.id,
        context_id: context_id,
        deployment_id: deployment_id,
        nrps_url: nrps_url,
        resource_link_id: resource_link_id
      )

      result = Services::Lti.sync_course_roster(lti_integration: lti_integration, lti_course: lti_course, nrps_sections: nrps_sections, current_user: current_user)
      had_changes ||= !result[:changed].empty?

      result[:changed].each_value do |section|
        total_sections += 1
        total_students += section[:size]
      end
    end
    metadata = {
      'number_of_sections' => total_sections,
      'number_of_students' => total_students,
    }
    # If section code present, this is a sync from the teacher dashboard by button, otherwise it's a sync
    # by LTI launch
    event_name = params[:section_code] ? 'lti_section_update_by_button' : 'lti_section_update_by_launch'
    Metrics::Events.log_event(
      user: current_user,
      event_name: event_name,
      metadata: metadata,
    )

    result[:course_name] = nrps_response.dig(:context, :title)
    @lti_section_sync_result = result
    @lms_name = lti_integration.platform_name

    respond_to do |format|
      format.html do
        if had_changes || params[:force]
          session[:keep_flashes] = true
          flash.keep
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

      metadata = {
        lms_name: platform_name,
      }
      Metrics::Events.log_event_with_session(
        session: session,
        event_name: 'lti_portal_registration_completed',
        metadata: metadata,
      )
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

    render lti_v1_integrations_path
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

  NAMESPACE = 'lti_v1_controller'.freeze

  private def unauthorized_status
    render(status: :unauthorized, json: {error: 'Unauthorized'})
  end

  private def create_state_and_nonce
    state = generate_random_string 10
    nonce = Digest::SHA2.hexdigest(generate_random_string(10))

    {state: state, nonce: nonce}
  end

  private def write_cache(key, value, expires_in = 1.minute)
    # TODO: Add error handling
    CDO.shared_cache.write("#{NAMESPACE}/#{key}", value.to_json, expires_in: expires_in)
  end

  private def read_cache(key)
    # TODO: Add error handling
    json_value = CDO.shared_cache.read("#{NAMESPACE}/#{key}")
    return nil unless json_value
    JSON.parse(json_value).symbolize_keys
  end

  private def generate_random_string(length)
    SecureRandom.alphanumeric length
  end

  private def log_unauthorized(exception, context = nil)
    Honeybadger.notify(
      exception,
      context: context
    )
    unauthorized_status
  end

  private def publish_linking_page_visit(user, platform_name)
    metadata = {
      'lms_name' => platform_name,
    }
    Metrics::Events.log_event(
      user: user,
      event_name: 'lti_account_linking_page_visit',
      metadata: metadata,
    )
  end
end
