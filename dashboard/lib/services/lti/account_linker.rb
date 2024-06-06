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
          handle_sections(rehydrated_user, user)
          user.lti_roster_sync_enabled = true if user.teacher?
          PartialRegistration.delete(session)
          rehydrated_user.destroy if rehydrated_user.id
        end
      end

      private def rehydrated_user
        @rehydrated_user ||= find_cached_user || ::User.new_with_session(ActionController::Parameters.new, session)
      end

      # The new user might already be in sections, if the account was created
      # via a roster sync. In this case, we need to swap the pre-existing user
      # into these sections to avoid the roster being in a bad state.
      private def handle_sections(user_to_remove, user_to_add)
        return if user_to_remove.sections_as_student.empty?
        user_to_remove.sections_as_student.each do |section|
          section.students << user_to_add
          section.students.destroy(user_to_remove)
        end
      end

      # A cached user should be referenced in the session. If the user was
      # created via roster sync, there might be a fully-created user with an ID.
      # Prefer this user if it exists.
      private def find_cached_user
        cache_key = session[PartialRegistration::SESSION_KEY]
        user_attrs = CDO.shared_cache.read(cache_key)
        return unless user_attrs

        user_id = JSON.parse(user_attrs).symbolize_keys[:id]
        return unless user_id

        ::User.find(user_id)
      end
    end
  end
end
