module Services
  module User
    class Sponsored < Services::Base
      PROVIDER_SPONSORED = 'sponsored'.freeze # "new" user created by a teacher -- logs in w/ name + secret picture/word

      attr_reader :user

      def initialize(user)
        @user = user
      end

      def call
        if Services::User::Migrated.new(user).call
          user.authentication_options.empty? && user.encrypted_password.blank?
        else
          user.provider == PROVIDER_SPONSORED
        end
      end
    end
  end
end
