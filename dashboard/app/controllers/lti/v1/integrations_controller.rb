# frozen_string_literal: true

module Lti
  module V1
    class IntegrationsController < ApplicationController
      # POST /lti/v1/integrations
      # Creates a new LtiIntegration
      def create
        begin
          params.require([:name, :client_id, :lms, :email])
        rescue ActionController::ParameterMissing
          flash.alert = I18n.t('lti.error.missing_params')
          return redirect_to new_lti_v1_integration_path
        end

        integration_name = params[:name]
        client_id = params[:client_id]
        platform_name = params[:lms]
        admin_email = params[:email]

        unless Policies::Lti::LMS_PLATFORMS.key?(platform_name.to_sym)
          flash.alert = I18n.t('lti.error.unsupported_lms_type')
          return redirect_to new_lti_v1_integration_path
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
          Metrics::Events.log_event(
            session: session,
            event_name: 'lti_portal_registration_completed',
            metadata: metadata,
            )
        end
        render 'lti/v1/integration_status'
      end

      # GET /lti/v1/integrations/new
      # Displays the onboarding portal for creating a new LTI Integration
      def new
        @form_data = {}
        @form_data[:lms_platforms] = Policies::Lti::LMS_PLATFORMS.map do |key, value|
          {platform: key, name: value[:name]}
        end

        render 'lti/v1/integrations'
      end
    end
  end
end
