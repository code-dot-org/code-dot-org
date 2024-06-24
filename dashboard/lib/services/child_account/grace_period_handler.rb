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
        return if Policies::ChildAccount::ComplianceState.locked_out?(user)
        # Users can be transitioned to the grace period only after the "all users' lockout" phase has started.
        return if all_users_lockout_start_date.nil? || all_users_lockout_start_date > DateTime.now

        if Policies::ChildAccount.compliant?(user)
          # Removes the "grace period" state if the user is now CAP compliant.
          Services::ChildAccount.remove_compliance(user) if Policies::ChildAccount::ComplianceState.grace_period?(user)
        elsif Policies::ChildAccount.user_predates_policy?(user)
          # Transits the user to the "grace period" state if they are not already in it.
          start_grace_period unless Policies::ChildAccount::ComplianceState.grace_period?(user)
        end
      end

      private def all_users_lockout_start_date
        return @all_users_lockout_start_date if defined? @all_users_lockout_start_date
        @all_users_lockout_start_date = Policies::ChildAccount.state_policy(user).try(:[], :lockout_date)
      end

      private def start_grace_period
        user.transaction do
          Services::ChildAccount.start_grace_period(user)

          scheduled_lockout_job = CAP::LockoutJob.schedule_for(user)

          raise LockoutSchedulingError, 'Failed to start grace period due to lockout not being scheduled' unless scheduled_lockout_job
        end
      end
    end
  end
end
