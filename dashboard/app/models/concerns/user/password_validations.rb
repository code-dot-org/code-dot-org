# This concern adds password validation logic to the User model.
# It includes default validations for presence, length, and confirmation,
# and applies stricter password rules for certain countries based on feature flags.

module User::PasswordValidations
  extend ActiveSupport::Concern

  include User::ProviderFlags

  # Password Constants
  PASSWORD_MAX_LENGTH = 128
  PASSWORD_MIN_LENGTH = 6
  PASSWORD_STRICT_MIN_LENGTH = 14
  # Countries that require a 14 character password minimum
  PASSWORD_STRICT_COUNTRIES = %w[AU NZ].freeze

  included do
    validates_presence_of     :password, if: :password_required?
    validates_confirmation_of :password, if: :password_required?
    validates_length_of       :password, minimum: :password_min_length, maximum: :password_max_length, allow_blank: true
  end

  class_methods do
    def password_min_length(user_type, country_code)
      if user_type == User::TYPE_TEACHER && PASSWORD_STRICT_COUNTRIES.include?(country_code) && strict_password_enabled?
        PASSWORD_STRICT_MIN_LENGTH
      else
        PASSWORD_MIN_LENGTH
      end
    end

    def strict_password_enabled?
      DCDO.get('strict-password-country', false)
    end
  end

  def password_min_length
    self.class.password_min_length(user_type, country_code)
  end

  def password_max_length
    PASSWORD_MAX_LENGTH
  end

  def password_required?
    # If the user is changing their password, then we should run all the password
    # field verifications.
    return true if changing_password?

    # Password is not required if the user is not managing their own account
    # (i.e., someone is creating their account for them or the user is using OAuth).
    return false unless managing_own_credentials?

    # Password is required for:
    # New users with no encrypted_password set
    new_user_without_password?
  end

  private def changing_password?
    password.present? || password_confirmation.present?
  end

  private def new_user_without_password?
    !persisted? && encrypted_password.blank?
  end

  private def managing_own_credentials?
    if provider.blank?
      true
    elsif manual?
      true
    elsif migrated?
      authentication_options.any? do |ao|
        ao.credential_type == AuthenticationOption::EMAIL
      end
    else
      false
    end
  end
end
