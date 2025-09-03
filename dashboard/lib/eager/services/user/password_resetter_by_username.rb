module Services
  module User
    class PasswordResetterByUsername < Services::Base
      attr_reader :username

      def initialize(username:)
        @username = username
      end

      def call
        user = ::User.find_or_initialize_by(username: username)

        if user.new_record?
          Cdo::Metrics.put(
            'User', 'PasswordResetUserNotFound', 1, {
              Environment: CDO.rack_env
            }
          )
          return user
        end

        # Just print out password reset instructions for Admin user
        user.raw_token = user.send(:set_reset_password_token)
        Cdo::Metrics.put(
          'User', 'PasswordResetByUsername', 1, {
            Environment: CDO.rack_env
          }
        )
        user
      end
    end
  end
end
