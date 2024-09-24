module Services
  module PartialRegistration
    class UserBuilder < Services::Base
      attr_reader :request

      delegate :session, :params, to: :request

      def initialize(request:)
        @request = request
      end

      def call
        user = ::User.new_with_session(user_params, session)
        user.save!
        user
      end

      private def user_params
        user_params = ActionController::Parameters.new(params).permit(Policies::Registration::NEW_USER_PERMITTED_PARAMS)

        user_params[:user_type] = user_params[:user_type].presence || session[:default_sign_up_user_type]
        case user_params[:user_type]
        when ::User::TYPE_TEACHER
          user_params[:age] = '21+'
          user_params[:email_preference_opt_in_required] = true
          user_params[:email_preference_opt_in] = user_params[:email_preference_opt_in] == 'true' ? 'yes' : 'no'
          user_params[:email_preference_request_ip] = request.ip
          user_params[:email_preference_source] = EmailPreference::ACCOUNT_SIGN_UP
          user_params[:email_preference_form_kind] = '0'
        when ::User::TYPE_STUDENT
          user_params[:parent_email_preference_request_ip] = request.ip
          user_params[:parent_email_preference_source] = EmailPreference::ACCOUNT_SIGN_UP
        end

        user_params[:data_transfer_agreement_accepted] = user_params[:data_transfer_agreement_accepted] == '1'
        if user_params[:data_transfer_agreement_required] && user_params[:data_transfer_agreement_accepted]
          user_params[:data_transfer_agreement_request_ip] = request.ip
          user_params[:data_transfer_agreement_source] = User::ACCOUNT_SIGN_UP
          user_params[:data_transfer_agreement_kind] = '0'
          user_params[:data_transfer_agreement_at] = DateTime.now
        end

        user_params
      end
    end
  end
end
