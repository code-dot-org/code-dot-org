module Lti
  module V1
    class UsersController < ApplicationController
      before_action :lti_account_linking_enabled?

      # GET /lti/v1/users/link_existing_account
      def link_existing_account
        user_params = params[:user] || ActionController::Parameters.new
        @user = User.new_with_session(user_params.permit(:user_type), session)
        render 'lti/v1/link_existing_account' and return
      end

      # POST /lti/v1/users/link_email
      def link_email
        head :bad_request unless PartialRegistration.in_progress?(session)
        params.require([:email, :password])
        existing_user = User.find_by_email_or_hashed_email(params[:email])
        if existing_user&.valid_password?(params[:password])
          user_params = params[:user] || ActionController::Parameters.new
          user_params[:user_type] ||= session[:default_sign_up_user_type]
          # rehydrated_user = User.new_with_session(user_params.permit(:user_type), session)
          # ao = rehydrated_user.authentication_options.first
          # existing_user.authentication_options << ao
          # Services::Lti.create_lti_user_identity(existing_user)
          # if existing_user.user_type == User::TYPE_TEACHER
          #   user.lti_roster_sync_enabled = true
          # end
          # PartialRegistration.delete(session)
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
