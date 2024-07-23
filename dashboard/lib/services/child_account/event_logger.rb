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

        CAP::UserEvent.create!(
          user: user,
          policy: policy,
          name: event_name,
          state_before: user.cap_state_previously_was,
          state_after: user.cap_state
        )
      end

      private def policy
        @policy ||= Policies::ChildAccount.state_policy(user).try(:[], :name)
      end
    end
  end
end
