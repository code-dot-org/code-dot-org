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
      end

      private def rehydrated_user
        @rehydrated_user ||= ::User.new_with_session(ActionController::Parameters.new, session)
      end
    end
  end
end
