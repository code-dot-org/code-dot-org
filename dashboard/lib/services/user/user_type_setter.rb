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
          UpgradeToTeacher.new(user: user, email: email, email_preference: email_preference).call
        when ::User::TYPE_STUDENT
          DowngradeToStudent.new(user: user).call
        else
          false
        end
      end
    end
  end
end
