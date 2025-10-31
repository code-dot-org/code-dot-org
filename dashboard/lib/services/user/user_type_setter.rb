module Services
  module User
    class UserTypeSetter < Services::Base
      attr_reader :user, :user_type, :email, :email_preference

      def initialize(user:, user_type:, email: nil, email_preference: nil)
        @user = user
        @user_type = user_type
        @email = email
        @email_preference = email_preference
      end

      def call
        previous_user_type = user.user_type

        result = case user_type
                 when ::User::TYPE_TEACHER
                   Services::User::UpgradeToTeacher.call(user: user, email: email, email_preference: email_preference)
                 when ::User::TYPE_STUDENT
                   Services::User::DowngradeToStudent.call(user: user)
                 else # Unexpected user type
                   false
                 end

        # upgrade_to_teacher and downgrade_to_student have inconsistent behavior so we need to
        # check that the new user type is different than the previous, before logging an event.
        if result && previous_user_type != user_type
          Metrics::Events.log_event(
            user: user,
            event_name: 'user_type_changed',
            metadata: {
              from_user_type: previous_user_type,
              to_user_type: user_type
            }
          )
        end

        result
      end
    end
  end
end
