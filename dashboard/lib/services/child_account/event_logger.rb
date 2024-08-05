module Services
  module ChildAccount
    class EventLogger < Services::Base
      # def self.log_parent_email_submit(user)
      # def self.log_parent_email_update(user)
      # def self.log_permission_granting(user)
      # def self.log_grace_period_start(user)
      # def self.log_account_locking(user)
      # def self.log_account_purging(user)
      # def self.log_compliance_removing(user)
      CAP::UserEvent.names.each_key do |event_name|
        define_singleton_method("log_#{event_name}") do |user|
          call(user: user, event_name: event_name)
        end
      end

      attr_reader :user, :event_name

      # @param user [User] The child account user.
      # @param event_name [String] The name of the CAP user event.
      def initialize(user:, event_name:)
        @user = user
        @event_name = event_name
      end

      # Logs a user event for a child account
      def call
        return unless policy

        # Get the value of the property before the user was last saved.
        # This will be the current value if the value was not updated.
        state_before = user.property_before_save('child_account_compliance_state')

        CAP::UserEvent.create!(user: user, policy: policy, name: event_name, state_before: state_before, state_after: user.child_account_compliance_state)
      end

      private def policy
        @policy ||= Policies::ChildAccount.state_policy(user).try(:[], :name)
      end
    end
  end
end
