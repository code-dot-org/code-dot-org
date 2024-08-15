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
          @lti_integration = user.lti_user_identities.first.lti_integration
          handle_sections(rehydrated_user, user)
          user.lti_roster_sync_enabled = true if user.teacher?
          user.lms_landing_opted_out = true
          PartialRegistration.delete(session)
          unless rehydrated_user.id
            # For fresh LTI users who are linking their account, we want to count
            # them as "new" users for metrics, since they won't hit the registration
            # controller like they would if they chose to create a new account.
            Metrics::Events.log_event(
              user: user,
              event_name: 'lti_user_created',
              metadata: {
                'user_type' => user.user_type,
                'lms_name' => @lti_integration[:platform_name],
                'context' => 'account_linking',
              }
            )
          end
          rehydrated_user.destroy if rehydrated_user.id
        end

        metadata = {
          'lms_name' => @lti_integration[:platform_name],
          'lms_client_id' => @lti_integration[:client_id],
          'login_type' => user.primary_contact_info&.credential_type,
        }
        Metrics::Events.log_event(
          user: user,
          event_name: 'lti_account_linked',
          metadata: metadata,
        )
      end

      private def rehydrated_user
        @rehydrated_user ||= find_cached_user || ::User.new_with_session(ActionController::Parameters.new, session)
      end

      # The new user might already be in sections, if the account was created
      # via a roster sync. In this case, we need to swap the pre-existing user
      # into these sections to avoid the roster being in a bad state.
      private def handle_sections(user_to_remove, user_to_add)
        handle_student_sections(user_to_remove, user_to_add) if user_to_remove.student?
        handle_coteacher_sections(user_to_remove, user_to_add) if user_to_remove.teacher?
      end

      private def handle_student_sections(user_to_remove, user_to_add)
        return if user_to_remove.sections_as_student.empty?
        user_to_remove.sections_as_student.each do |section|
          section.students << user_to_add
          section.students.destroy(user_to_remove&.id)
        end
      end

      private def handle_coteacher_sections(user_to_remove, user_to_add)
        return if user_to_remove.sections_instructed.empty?
        user_to_remove.sections_instructed.each do |section|
          section.add_instructor(user_to_add)
          section.update(user_id: user_to_add.id) if section.user_id == user_to_remove.id
          section.remove_instructor(user_to_remove)
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
