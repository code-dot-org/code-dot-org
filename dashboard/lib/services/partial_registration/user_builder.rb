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
        user_params = ActionController::Parameters.new(params).require(:user).permit(new_user_permitted_params)
        user_params[:locale] = request.locale
        user_params[:user_type] = user_params[:user_type].presence || session[:default_sign_up_user_type]
        case user_params[:user_type]
        when ::User::TYPE_TEACHER
          user_params[:age] = '21+'
          user_params[:email_preference_opt_in_required] = true
          user_params[:email_preference_opt_in] = ActiveModel::Type::Boolean.new.cast(user_params[:email_preference_opt_in]) ? 'yes' : 'no'
          user_params[:email_preference_request_ip] = request.ip
          user_params[:email_preference_source] = EmailPreference::ACCOUNT_SIGN_UP
          user_params[:email_preference_form_kind] = '0'

          if user_params[:school_info_attributes].present?
            if SharedConstants::NON_SCHOOL_OPTIONS.to_h.value?(user_params[:school_info_attributes]['schoolId'])
              user_params[:school_info_attributes]['schoolId'] = nil
            end
            school_params = {
              school_id: user_params[:school_info_attributes]['schoolId'],
              school_name: user_params[:school_info_attributes]['schoolName'],
              school_type: user_params[:school_info_attributes]['schoolType'],
              school_zip: user_params[:school_info_attributes]['schoolZip'],
              school_state: user_params[:school_info_attributes]['schoolState'],
              country: user_params[:school_info_attributes]['country'],
              full_address: user_params[:school_info_attributes]['fullAddress']
            }
            user_params[:school_info_attributes] = ActionController::Parameters.new(school_params).permit(:school_id, :school_name, :school_type, :school_zip, :school_state, :country, :full_address)
          end
        when ::User::TYPE_STUDENT
          if user_params[:parent_email_preference_email].present?
            user_params[:parent_email_preference_opt_in_required] = '1'
            user_params[:parent_email_preference_opt_in] = user_params[:parent_email_preference_opt_in].present? ? 'yes' : 'no'
            user_params[:parent_email_update_only] = '0'
            user_params[:parent_email_preference_request_ip] = request.ip
            user_params[:parent_email_preference_source] = EmailPreference::ACCOUNT_SIGN_UP
          else
            user_params[:parent_email_preference_opt_in_required] = '0'
            user_params[:parent_email_update_only] = '1'
          end
        end

        user_params[:data_transfer_agreement_accepted] = user_params[:data_transfer_agreement_accepted] == '1'
        if user_params[:data_transfer_agreement_required] && user_params[:data_transfer_agreement_accepted]
          user_params[:data_transfer_agreement_request_ip] = request.ip
          user_params[:data_transfer_agreement_source] = ::User::ACCOUNT_SIGN_UP
          user_params[:data_transfer_agreement_kind] = '0'
          user_params[:data_transfer_agreement_at] = DateTime.now
        end

        user_params
      end

      private def new_user_permitted_params
        [
          :locale,
          :user_type,
          :email,
          :hashed_email,
          :name,
          :email_preference_opt_in_required,
          :email_preference_opt_in,
          :email_preference_request_ip,
          :email_preference_source,
          :email_preference_form_kind,
          {school_info_attributes: [:schoolId, :schoolName, :schoolType, :schoolZip, :schoolState, :country, :fullAddress]},
          :age,
          :gender,
          :us_state,
          :parent_email_preference_email,
          :parent_email_preference_opt_in,
          :parent_email_preference_request_ip,
          :parent_email_preference_source,
          :data_transfer_agreement_accepted,
          :data_transfer_agreement_required,
          :data_transfer_agreement_request_ip,
          :data_transfer_agreement_source,
          :data_transfer_agreement_kind,
          :data_transfer_agreement_at
        ]
      end
    end
  end
end
