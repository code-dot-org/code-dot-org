module Metrics
  module Events
    class << self
      # Logs an event, delegating to the appropriate handler based on environment
      def log_event(user:, event_type:, event_name:, metadata: {})
        if CDO.rack_env?(:development)
          log_event_to_stdout(user: user, event_type: event_type, event_name: event_name, metadata: metadata)
        else
          log_event_with_statsig(user: user, event_type: event_type, event_name: event_name, metadata: metadata)
        end
      rescue => exception
        Honeybadger.notify(exception)
      end

      private

      # Logs an event to Statsig
      def log_event_with_statsig(user:, event_type:, event_name:, metadata:)
        statsig_user = build_statsig_user(user)
        Statsig.log_event(statsig_user, event_type, event_name, metadata)
      end

      # Builds a StatsigUser object from a user entity
      def build_statsig_user(user)
        StatsigUser.new({'userID' => user.id.to_s})
      end

      # Logs an event to stdout, useful for development and debugging
      def log_event_to_stdout(user:, event_type:, event_name:, metadata:)
        event_details = {
          user_id: user.id,
          event_type: event_type,
          event_name: event_name,
          metadata: metadata
        }
        puts "Logging Event: #{event_details.to_json}"
      end
    end
  end
end
