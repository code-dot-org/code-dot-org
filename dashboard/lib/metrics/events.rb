module Metrics
  module Events
    class << self
      # Logs an event, delegating to the appropriate handler based on environment
      def log_event(user:, event_name:, event_value: nil, metadata: {})
        event_value = event_name if event_value.nil?
        if CDO.rack_env?(:development)
          log_event_to_stdout(user: user, event_name: event_name, event_value: event_value, metadata: metadata)
        else
          log_event_with_statsig(user: user, event_name: event_name, event_value: event_value, metadata: metadata)
        end
      rescue => exception
        Honeybadger.notify(
          exception,
          error_message: 'Error logging event',
      )
      end

      private

      # Logs an event to Statsig
      def log_event_with_statsig(user:, event_name:, event_value:, metadata:)
        statsig_user = build_statsig_user(user)
        Statsig.log_event(statsig_user, event_name, event_value, metadata)
      end

      # Builds a StatsigUser object from a user entity
      def build_statsig_user(user)
        StatsigUser.new({'userID' => user.id.to_s})
      end

      # Logs an event to stdout, useful for development and debugging
      def log_event_to_stdout(user:, event_name:, event_value:, metadata:)
        event_details = {
          user_id: user.id,
          event_name: event_name,
          event_value: event_value,
          metadata: metadata
        }
        puts "Logging Event: #{event_details.to_json}"
      end
    end
  end
end
