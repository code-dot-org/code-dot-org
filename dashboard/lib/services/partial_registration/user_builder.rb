module Services
  module PartialRegistration
    class UserBuilder < Services::Base
      include SchoolInfoDeduplicator

      attr_reader :request

      delegate :session, :params, to: :request

      def initialize(request:)
        @request = request
      end

      def call
        all_params = ActionController::Parameters.new(params)
        user = ::User.new_with_session(user_params(all_params), session)
        user.save!

        set_school_info(all_params, user)

        user
      end

      private def user_params(all_params)
        new_user_params = all_params.permit(Policies::Registration::NEW_USER_PERMITTED_PARAMS)

        new_user_params[:user_type] = new_user_params[:user_type].presence || session[:default_sign_up_user_type]
        case new_user_params[:user_type]
        when ::User::TYPE_TEACHER
          new_user_params[:age] = '21+'
          new_user_params[:email_preference_opt_in_required] = true
          new_user_params[:email_preference_opt_in] = new_user_params[:email_preference_opt_in] == 'true' ? 'yes' : 'no'
          new_user_params[:email_preference_request_ip] = request.ip
          new_user_params[:email_preference_source] = EmailPreference::ACCOUNT_SIGN_UP
          new_user_params[:email_preference_form_kind] = '0'

          if SharedConstants::SCHOOL_DROPDOWN_OTHER_OPTIONS.to_h.value?(new_user_params[:school])
            new_user_params[:school] = nil
          end
        when ::User::TYPE_STUDENT
          new_user_params[:parent_email_preference_request_ip] = request.ip
          new_user_params[:parent_email_preference_source] = EmailPreference::ACCOUNT_SIGN_UP
        end

        new_user_params[:data_transfer_agreement_accepted] = new_user_params[:data_transfer_agreement_accepted] == '1'
        if new_user_params[:data_transfer_agreement_required] && new_user_params[:data_transfer_agreement_accepted]
          new_user_params[:data_transfer_agreement_request_ip] = request.ip
          new_user_params[:data_transfer_agreement_source] = User::ACCOUNT_SIGN_UP
          new_user_params[:data_transfer_agreement_kind] = '0'
          new_user_params[:data_transfer_agreement_at] = DateTime.now
        end

        new_user_params
      end

      private def set_school_info(all_params, user)
        if all_params[:user_type] == ::User::TYPE_TEACHER && all_params[:school] != SharedConstants::SCHOOL_DROPDOWN_OTHER_OPTIONS.SELECT_A_SCHOOL
          school_info = {
            school_id: all_params[:school_id],
            zip: all_params[:school_zip],
            school_name: all_params[:school_name],
            country: all_params[:school_country]
          }

          if SharedConstants::SCHOOL_DROPDOWN_OTHER_OPTIONS.to_h.value?(all_params[:school])
            school_info[:school_id] = nil
            school_info[:validation_type] = SchoolInfo::VALIDATION_NONE
          end

          user.update_school_info(get_duplicate_school_info(school_info) || SchoolInfo.create!(school_info))
        end
      end
    end
  end
end
