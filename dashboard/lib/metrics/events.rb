require 'cdo/statsig'

# This is a wrapper for the Statsig SDK.
#
# Example Usage:
#
# Specify any (optional) metadata relevant to the event
# metadata = {
#   foo: 'bar',
#   fizz: 'buzz',
# }
#
# Metrics::Events.log_event(event_name: 'some_event_name')
# Metrics::Events.log_event(user: current_user, event_name: 'some_event_name', metadata: metadata)
# Metrics::Events.log_event(user: current_user, event_name: 'some_event_name', event_value: 'some_event_value', metadata: metadata)
# Metrics::Events.log_event(user: current_user, event_name: 'some_event_name', get_enabled_experiments: true)

module Metrics
  module Events
    class << self
      # Logs an event, delegating to the appropriate handler based on environment
      #
      # Parameters:
      # @user - a logged in user instance (optional)
      # @event_name - the name of the event to be logged (required)
      # @event_value - the value of the event (optional)
      # @metadata - a metadata hash with relevant data (optional)
      # @get_enabled_experiments - include list of experiements the user is enrolled in (optional)
      def log_event(user: nil, event_name:, event_value: nil, metadata: {}, get_enabled_experiments: false)
        event_value = event_name if event_value.nil?
        enabled_experiments = get_enabled_experiments && user.present? ? user.get_active_experiment_names : nil
        managed_test_environment = CDO.running_web_application? && CDO.test_system?

        if CDO.rack_env?(:development)
          log_event_to_stdout(user: user, event_name: event_name, event_value: event_value, metadata: metadata, enabled_experiments: enabled_experiments)
        elsif CDO.rack_env?(:production) || managed_test_environment
          log_statsig_event_with_cdo_user(user: user, event_name: event_name, event_value: event_value, metadata: metadata, enabled_experiments: enabled_experiments)
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

      def log_event_with_session(session:, event_name:, event_value: nil, metadata: {})
        event_value = event_name if event_value.nil?
        managed_test_environment = CDO.running_web_application? && CDO.test_system?
        statsig_user = StatsigUser.new({'userID' => session[:statsig_stable_id]})

        if CDO.rack_env?(:development)
          log_event_to_stdout_with_session(session: session, event_name: event_name, event_value: event_value, metadata: metadata)
        elsif CDO.rack_env?(:production) || managed_test_environment
          log_statsig_event(statsig_user: statsig_user, event_name: event_name, event_value: event_value, metadata: metadata)
        else
          # We don't want to log in other environments, just return silently
          return
        end
      rescue => exception
        Honeybadger.notify(
          exception,
          error_message: 'Error logging session event',
          )
      end

      # Logs an event to Statsig
      private def log_statsig_event_with_cdo_user(user:, event_name:, event_value:, metadata:, enabled_experiments:)
        statsig_user = build_statsig_user(user: user, enabled_experiments: enabled_experiments)
        log_statsig_event(statsig_user: statsig_user, event_name: event_name, event_value: event_value, metadata: metadata)
      end

      private def log_statsig_event(statsig_user:, event_name:, event_value:, metadata:)
        # Re-initialize Statsig to make sure it's available in current thread.
        Cdo::StatsigInitializer.init
        Statsig.log_event(statsig_user, event_name, event_value, metadata)
      end

      # Builds a StatsigUser object from a user entity
      private def build_statsig_user(user:, enabled_experiments:)
        if user.present?
          custom_ids = {
            user_type: user.user_type,
            enabled_experiments: enabled_experiments,
          }.compact
          StatsigUser.new({'userID' => user.id.to_s, 'custom_ids' => custom_ids})
        else
          StatsigUser.new({'userID' => ''})
        end
      end

      # Logs an event to stdout, useful for development and debugging
      private def log_event_to_stdout(user:, event_name:, event_value:, metadata:, enabled_experiments:)
        user_id = user.present? ? user.id : ''
        user_type = user.present? ? user.user_type : ''
        event_details = {
          user_id: user_id,
          custom_ids: {
            user_type: user_type,
            enabled_experiments: enabled_experiments,
          }.compact,
          event_name: event_name,
          event_value: event_value,
          metadata: metadata,
        }
        puts "Logging Event: #{event_details.to_json}"
      end

      # Logs an event to stdout, useful for development and debugging
      private def log_event_to_stdout_with_session(session:, event_name:, event_value:, metadata:)
        event_details = {
          user_id: session[:statsig_stable_id],
          event_name: event_name,
          event_value: event_value,
          metadata: metadata,
        }
        puts "Logging Event: #{event_details.to_json}"
      end
    end
  end
end
