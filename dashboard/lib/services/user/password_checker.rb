module Services
  module User
    class PasswordChecker < Services::Base
      def self.requires_strict_password?(user)
        user.new_record? && user.teacher? && strict_password_country?(user.sign_up_country)
      end

      def self.strict_password_country?(country_code)
        ::User::STRICT_PASSWORD_COUNTRIES.include?(country_code)
      end
    end
  end
end
