module Services
  module ChildAccount
    class GracePeriodHandler < Services::Base
      LockoutSchedulingError = Class.new(StandardError)

      attr_reader :user

      # @param user [User] the student account
      def initialize(user:)
        @user = user
      end

      def call
        return false unless eligible?

        user.transaction do
          Services::ChildAccount.start_grace_period(user)

          estimated_lockout_date = Policies::ChildAccount.lockout_date(user)
          raise LockoutSchedulingError, 'Lockout date is not set' unless estimated_lockout_date

          CAP::LockoutJob.set(wait_until: estimated_lockout_date).perform_later(user_id: user.id)
        end

        true
      end

      # Checks if the user can be transited to the grace period state.
      private def eligible?
        return false if Policies::ChildAccount.compliant?(user)
        return false if Policies::ChildAccount::ComplianceState.locked_out?(user)
        # If the user is already in the grace period, it cannot be started again.
        return false if Policies::ChildAccount::ComplianceState.grace_period?(user)
        # Only "pre-policy" created students can be transited to the grace period.
        return false unless Policies::ChildAccount.user_predates_policy?(user)

        user_state_policy = Policies::ChildAccount.state_policy(user)
        return false unless user_state_policy

        # The grace period can only begin after the "all users' lockout" phase starts.
        user_state_policy[:lockout_date] <= DateTime.now
      end
    end
  end
end
