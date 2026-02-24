module Services
  module User
    class DowngradeToStudent < Services::Base
      attr_reader :user

      def initialize(user:)
        @user = user
      end

      def call
        return true if user.student? # No-op if user is already a student
        user.update(
          user_type: ::User::TYPE_STUDENT,
          given_name: nil,
          family_name: nil,
          educator_role: nil
        )
      end
    end
  end
end
