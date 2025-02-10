module Policy
  module User
    class UserType
      TYPE_STUDENT = SharedConstants::USER_TYPES.STUDENT
      TYPE_TEACHER = SharedConstants::USER_TYPES.TEACHER

      attr_reader :user

      def initialize(user)
        @user = user
      end

      def student?
        user.user_type == TYPE_STUDENT
      end

      def teacher?
        user.user_type == TYPE_TEACHER
      end
    end
  end
end
