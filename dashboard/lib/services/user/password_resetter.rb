module Services
  module User
    class PasswordResetter < Services::Base
      attr_reader :email

      def initialize(email:)
        @email = email
      end

      def call
        return user if user.errors.present?

        if !user.nil? && user.authentication_options.any?(&:email?)
          user.raw_token = send_reset_password_instructions
        else
          Cdo::Metrics.put(
            'User', 'PasswordResetEmailAuthNotFound', 1, {
              Environment: CDO.rack_env
            }
          )
        end
        user
      end

      private def user
        return @user if defined? @user
        if email.blank?
          @user = ::User.new
          @user.errors.add :email, ::I18n.t('activerecord.errors.messages.blank')
        else
          # We are no longer sending an email to parents, so grab the first user we find
          # (a user with an Email auth option first, otherwise any user that has that email)
          @user = ::User.find_by_email_or_hashed_email(email)
        end
        @user
      end

      private def send_reset_password_instructions
        raw = user.send(:set_reset_password_token)
        user.send(:send_devise_notification, :reset_password_instructions, user.raw_token, {to: email})
        raw
      rescue ArgumentError
        user.errors.add :base, I18n.t('password.reset_errors.invalid_email')
        user.send(clear_reset_password_token)
        nil
      end
    end
  end
end
