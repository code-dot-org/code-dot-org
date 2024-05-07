module Lti
  module V1
    class UsersController < ApplicationController
      before_action :lti_account_linking_enabled?

      # GET /lti/v1/users/new
      def new_user_landing
        render 'lti/v1/new_user_landing_page'
      end

      # GET /lti/v1/users/link_existing_account
      def link_existing_account
        @user = User.new_with_session(ActionController::Parameters.new, session)
        render 'lti/v1/link_existing_account'
      end

      # POST /lti/v1/users/link_email
      def link_email
        head :bad_request unless PartialRegistration.in_progress?(session)
        params.require([:email, :password])
        existing_user = User.find_by_email_or_hashed_email(params[:email])
        if existing_user&.valid_password?(params[:password])
          Services::Lti::AccountLinker.call(user: existing_user, session: session)
          sign_in existing_user
          redirect_to home_path
        else
          head :unauthorized
        end
      end

      private def lti_account_linking_enabled?
        head :not_found unless DCDO.get('lti_account_linking_enabled', false)
      end
    end
  end
end
