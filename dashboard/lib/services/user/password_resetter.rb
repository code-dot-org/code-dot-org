module Services
  module User
    class PasswordResetter < Services::Base
      attr_reader :email, :user

      def initialize(email:)
        @email = email
        @user = nil
      end

      def call
        if email.blank?
          @user = ::User.new
          user.errors.add :email, ::I18n.t('activerecord.errors.messages.blank')
          return user
        end
        # We are no longer sending an email to parents, so grab the first user we find
        # (a user with an Email auth option first, otherwise any user that has that email)
        @user = ::User.find_by_email_or_hashed_email(email)
        if user.nil?
          not_found_user = ::User.new(email: email)
          Cdo::Metrics.put(
            'User', 'PasswordResetUserNotFound', 1, {
              Environment: CDO.rack_env
            }
          )
          return not_found_user
        end

        if user.authentication_options.any?(&:email?)
          user.raw_token = send_reset_password_instructions
        else
          Cdo::Metrics.put(
            'User', 'PasswordResetEmailAuthNotFound', 1, {
              Environment: CDO.rack_env,
              UserType: user.user_type
            }
          )
        end
        user
      end

      private def send_reset_password_instructions
        raw, enc = Devise.token_generator.generate(::User, :reset_password_token)

        user.reset_password_token   = enc
        user.reset_password_sent_at = Time.now.utc
        user.save(validate: false)

        user.send_reset_email(:reset_password_instructions, raw, email)
        raw
      rescue ArgumentError
        errors.add :base, I18n.t('password.reset_errors.invalid_email')
        return nil
      end
    end
  end
end
