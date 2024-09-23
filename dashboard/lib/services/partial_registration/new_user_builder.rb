module Services
  module PartialRegistration
    class NewUserBuilder < Services::Base
      attr_reader :request

      def initialize(request:)
        @request = request
      end

      def call
        @session = @request.session
        @user_params = @request.params

        new_user_params = ActionController::Parameters.new(@user_params)
        new_user_params[:user_type] = @user_params[:user_type].presence || @session[:default_sign_up_user_type]
        new_user_params[:email] = @user_params[:email]
        new_user_params[:age] = new_user_params[:user_type] == 'teacher' ? '21+' : @user_params[:age]

        # Set email and data transfer preferences
        if new_user_params[:user_type] == 'teacher'
          new_user_params[:email_preference_opt_in_required] = true
          new_user_params[:email_preference_opt_in] = @user_params[:email_preference_opt_in] == 'true' ? 'yes' : 'no'
          new_user_params[:email_preference_request_ip] = @request.ip
          new_user_params[:email_preference_source] = EmailPreference::ACCOUNT_SIGN_UP
          new_user_params[:email_preference_form_kind] = '0'
        elsif new_user_params[:user_type] == 'student'
          new_user_params[:parent_email_preference_request_ip] = @request.ip
          new_user_params[:parent_email_preference_source] = EmailPreference::ACCOUNT_SIGN_UP
        end

        new_user_params[:data_transfer_agreement_accepted] = @user_params[:data_transfer_agreement_accepted] == '1'
        if new_user_params[:data_transfer_agreement_required] && @user_params[:data_transfer_agreement_accepted]
          new_user_params[:data_transfer_agreement_accepted] = true
          new_user_params[:data_transfer_agreement_request_ip] = @request.ip
          new_user_params[:data_transfer_agreement_source] = User::ACCOUNT_SIGN_UP
          new_user_params[:data_transfer_agreement_kind] = '0'
          new_user_params[:data_transfer_agreement_at] = DateTime.now
        end

        @user = User.new_with_session(new_user_params.permit(Policies::Registration::NEW_USER_PERMITTED_PARAMS), @session)
        @user.save!
        @user
      end
    end
  end
end
