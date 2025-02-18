module Services
  module ChildAccount
    class LockoutHandler < Services::Base
      attr_reader :user

      # @param user [User] the student account
      def initialize(user:)
        @user = user
      end

      # @return [true,false] true if the user is locked out, false otherwise
      def call
        return true if Policies::ChildAccount::ComplianceState.locked_out?(user)
        return false if Policies::ChildAccount.compliant?(user)

        user_lockout_date = Policies::ChildAccount.lockout_date(user)
        return false if user_lockout_date.nil? || user_lockout_date > DateTime.now

        Services::ChildAccount.lock_out(user)

        true
      end
    end
  end
end
