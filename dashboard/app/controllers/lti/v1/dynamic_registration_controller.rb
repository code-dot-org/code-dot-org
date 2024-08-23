require 'clients/cache_client'
require 'clients/lti_dynamic_registration_client'
require 'metrics/events'

module Lti
  module V1
    class DynamicRegistrationController < ApplicationController
      before_action :init_cache
      # Don't require an authenticity token because LTI Platforms POST to this
      # controller.
      skip_before_action :verify_authenticity_token

      # GET /lti/v1/dynamic_registration
      # Initiate LTI Dynamic Registration flow
      def new_registration
        begin
          params.require([:openid_configuration, :registration_token])
          openid_configuration_url = params[:openid_configuration]
          registration_token = params[:registration_token]
          openid_config = JSON.parse(HTTParty.get(openid_configuration_url).body)
        rescue => exception
          message = 'Error getting LMS openid_configuration'
          Harness.error_notify(exception, context: {message: message})
          return render status: :internal_server_error, json: {error: message}
        end
        # Create registration ID to pass to be used by the view as a hidden form
        # field. This ID will be used to read the registration_data back out from
        # the cache in the create_registration method
        @registration_id = SecureRandom.uuid
        registration_data = {
          registration_token: registration_token,
          registration_endpoint: openid_config['registration_endpoint'],
          issuer: openid_config['issuer'],
          lms_account_name: openid_config.dig(Policies::Lti::LTI_PLATFORM_CONFIGURATION, Policies::Lti::CANVAS_ACCOUNT_NAME),
        }
        # Expire cache in 1 hour to match expiration of registration token
        @cache.write(@registration_id, registration_data, 1.hour)
        render 'lti/v1/dynamic_registration', layout: false
      end

      # POST /lti/v1/dynamic_registration
      # Initiate LTI Dynamic Registration Request and create LTI Integration
      def create_registration
        begin
          params.require([:email])
        rescue ActionController::ParameterMissing
          return render json: {error: I18n.t('lti.error.missing_email')}, status: :bad_request
        end

        admin_email = params[:email]
        cache_key = params[:registration_id]
        # Get cached values
        registration_data = @cache.read(cache_key)

        # Don't proceed if expected registration data doesn't exist
        return unauthorized_status if registration_data.nil?

        platform = Policies::Lti.find_platform_by_issuer(registration_data[:issuer])
        platform_name = Policies::Lti.find_platform_name_by_issuer(registration_data[:issuer])
        if platform.nil?
          message = "Unsupported issuer: #{registration_data[:issuer]}"
          Harness.error_notify(
            'LTI dynamic registration error',
            context: {
              message: message,
            }
          )
          return render status: :unprocessable_entity, json: {error: message}
        end

        begin
          dynamic_registration_client = LtiDynamicRegistrationClient.new(registration_data[:registration_token], registration_data[:registration_endpoint])
          registration_response = dynamic_registration_client.make_registration_request
        rescue => exception
          message = 'Error creating registration'
          Harness.error_notify(exception, context: {message: message})
          return render status: :internal_server_error, json: {error: message}
        end

        existing_integration = Queries::Lti.get_lti_integration(platform[:issuer], registration_response[:client_id])
        if existing_integration.nil?
          Services::Lti.create_lti_integration(
            name: registration_data[:lms_account_name],
            client_id: registration_response[:client_id],
            issuer: platform[:issuer],
            platform_name: platform_name,
            auth_redirect_url: platform[:auth_redirect_url],
            jwks_url: platform[:jwks_url],
            access_token_url: platform[:access_token_url],
            admin_email: admin_email,
          )
          metadata = {
            lms_name: platform[:name],
          }
          Metrics::Events.log_event_with_session(
            session: session,
            event_name: 'lti_dynamic_registration_completed',
            metadata: metadata,
          )

          return render status: :created, json: {}
        else
          return render status: :conflict, json: {error: I18n.t('lti.integration.exists_error')}
        end
      end

      private def init_cache
        cache_namespace = 'lti_v1_dynamic_registration'
        @cache = CacheClient.new(cache_namespace)
      end

      private def unauthorized_status
        render(status: :unauthorized, json: {error: 'Unauthorized'})
      end
    end
  end
end
