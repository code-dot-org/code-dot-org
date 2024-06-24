module Lti
  module V1
    class AccountLinkingController < ApplicationController
      before_action :lti_account_linking_enabled?

      # GET /lti/v1/account_linking/landing
      def landing
      end

      # GET /lti/v1/account_linking/existing_account
      def existing_account
        @user = User.new_with_session(ActionController::Parameters.new, session)
      end

      # GET /lti/v1/account_linking/finish_link
      def finish_link
        # If the user is logged in, we need to log them out. Signing them out will
        # clear the session, so we need to store cache key first, sign them out,
        # then set it again in their now empty session.
        if current_user
          partial_registration_cache_key = PartialRegistration.cache_key(current_user)
          sign_out current_user
          session[PartialRegistration::SESSION_KEY] = partial_registration_cache_key
        end

        redirect_to user_session_path
      end

      # POST /lti/v1/account_linking/link_email
      def link_email
        head :bad_request unless PartialRegistration.in_progress?(session)
        params.require([:email, :password])
        existing_user = User.find_by_email_or_hashed_email(params[:email])
        if existing_user&.valid_password?(params[:password])
          Services::Lti::AccountLinker.call(user: existing_user, session: session)
          sign_in existing_user
          target_url = session[:user_return_to] || home_path
          redirect_to target_url
        else
          flash.alert = I18n.t('lti.account_linking.invalid_credentials')
          redirect_to user_session_path(lti_provider: params[:lti_provider], lms_name: params[:lms_name]) and return
        end
      end

      private def lti_account_linking_enabled?
        head :not_found unless DCDO.get('lti_account_linking_enabled', false)
      end
    end
  end
end
