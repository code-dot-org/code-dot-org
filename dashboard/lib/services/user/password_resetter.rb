module Services
  module User
    class PasswordResetter < Services::Base
      attr_reader :email, :username

      def initialize(email: nil, username: nil)
        @email = email
        @username = username
      end

      def call
        return user if user.errors.present?

        if user.new_record?
          Cdo::Metrics.put(
            'User', 'PasswordResetUserNotFound', 1, {
              Environment: CDO.rack_env
            }
          )
          return user
        end

        if username.present?
          reset_by_username
        elsif email.present?
          reset_by_email
        end
      end

      private def reset_by_email
        # Only send if the user has an email auth option OR if the user is unmigrated and has a password login
        if user.authentication_options.any?(&:email?) || user.provider.nil?
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

      private def reset_by_username
        # Just print out password reset instructions for Admin user
        user.raw_token = send_reset_password_instructions
        Cdo::Metrics.put(
          'User', 'PasswordResetByUsername', 1, {
            Environment: CDO.rack_env
          }
        )
        user
      end

      private def user
        return @user if defined? @user
        if email.blank? && username.blank?
          @user = ::User.new
          @user.errors.add :email, ::I18n.t('activerecord.errors.messages.blank')
        else
          # We are no longer sending an email to parents, so grab the first user we find
          # (a user with an Email auth option first, otherwise any user that has that email)
          if email.present?
            @user = ::User.find_by_email_or_hashed_email(email) || ::User.new(email: email)
          elsif username.present? # Allow search by username for admin
            @user = ::User.find_by(username: username) || ::User.new(username: username)
          end
        end
        @user
      end

      private def send_reset_password_instructions
        raw = user.send(:set_reset_password_token)
        if email
          user.send(:send_devise_notification, :reset_password_instructions, raw, {to: email})
          Cdo::Metrics.put(
            'User', 'PasswordResetEmailSent', 1, {
              Environment: CDO.rack_env
            }
          )
        end
        raw
      rescue ArgumentError
        user.errors.add :base, I18n.t('password.reset_errors.invalid_email')
        user.send(:clear_reset_password_token)
        nil
      end
    end
  end
end
