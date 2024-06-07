require 'metrics/events'

module Services
  module Lti
    class AccountLinker < Services::Base
      attr_reader :user, :session

      def initialize(user:, session:)
        @user = user
        @session = session
      end

      def call
        ActiveRecord::Base.transaction do
          user.authentication_options << rehydrated_user.authentication_options.first
          Services::Lti.create_lti_user_identity(user)
          user.lti_roster_sync_enabled = true if user.teacher?
          PartialRegistration.delete(session)
        end

        lti_integration = user.lti_user_identities.first.lti_integration
        metadata = {
          'user_type' => user.user_type,
          'lms_name' => lti_integration[:platform_name],
          'lms_client_id' => lti_integration[:client_id],
          'login_type' => user.primary_contact_info&.credential_type,
        }
        Metrics::Events.log_event(
          user: user,
          event_name: 'lti_account_linked',
          metadata: metadata,
        )
      end

      private def rehydrated_user
        @rehydrated_user ||= ::User.new_with_session(ActionController::Parameters.new, session)
      end
    end
  end
end
