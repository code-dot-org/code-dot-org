module Services
  module User
    module UserType
      class DowngradeToStudent < Services::Base
        attr_reader :user

        def initialize(user:)
          @user = user
        end

        def call
          return true if user.student?
          user.update(user_type: ::User::TYPE_STUDENT)
        end
      end
    end
  end
end
