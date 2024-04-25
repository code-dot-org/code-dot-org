require 'cdo/statsig'

module Metrics
  module Events
    class << self
      # Logs an event, delegating to the appropriate handler based on environment
      def log_event(user:, event_name:, event_value: nil, metadata: {}, enabled_experiments: nil)
        event_value = event_name if event_value.nil?
        managed_test_environment = CDO.running_web_application? && CDO.test_system?

        if CDO.rack_env?(:development)
          log_event_to_stdout(user: user, event_name: event_name, event_value: event_value, metadata: metadata, enabled_experiments: enabled_experiments)
        elsif CDO.rack_env?(:production) || managed_test_environment
          log_event_with_statsig(user: user, event_name: event_name, event_value: event_value, metadata: metadata, enabled_experiments: enabled_experiments)
        else
          # We don't want to log in other environments, just return silently
          return
        end
      rescue => exception
        Honeybadger.notify(
          exception,
          error_message: 'Error logging event',
      )
      end

      # Logs an event to Statsig
      private def log_event_with_statsig(user:, event_name:, event_value:, metadata:, enabled_experiments:)
        # Re-initialize Statsig to make sure it's avaiable in current thread.
        Cdo::StatsigInitializer.init
        statsig_user = build_statsig_user(user: user, enabled_experiments: enabled_experiments)
        Statsig.log_event(statsig_user, event_name, event_value, metadata)
      end

      # Builds a StatsigUser object from a user entity
      private def build_statsig_user(user:, enabled_experiments:)
        custom_ids = {
          user_type: user.user_type,
          enabled_experiments: enabled_experiments,
        }.compact

        StatsigUser.new({'userID' => user.id.to_s, 'custom_ids' => custom_ids})
      end

      # Logs an event to stdout, useful for development and debugging
      private def log_event_to_stdout(user:, event_name:, event_value:, metadata:, enabled_experiments:)
        event_details = {
          user_id: user.id,
          enabled_experiments: enabled_experiments,
          event_name: event_name,
          event_value: event_value,
          metadata: metadata,
        }.compact
        puts "Logging Event: #{event_details.to_json}"
      end
    end
  end
end
