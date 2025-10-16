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
        case user_type
        when ::User::TYPE_TEACHER
          Services::User::UpgradeToTeacher.call(user: user, email: email, email_preference: email_preference)
        when ::User::TYPE_STUDENT
          Services::User::DowngradeToStudent.call(user: user)
        else
          false # Unexpected user type
        end
      end
    end
  end
end
