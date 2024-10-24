require 'cdo/global_edition'
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
      def log_event(user: nil, event_name:, event_value: nil, metadata: {}, get_enabled_experiments: false, session: nil)
        event_value = event_name if event_value.nil?
        enabled_experiments = get_enabled_experiments && user.present? ? user.get_active_experiment_names : nil
        managed_test_environment = CDO.running_web_application? && CDO.test_system?
        statsig_stable_id = session[:statsig_stable_id]

        if CDO.rack_env?(:development)
          log_event_to_stdout(user: user, event_name: event_name, event_value: event_value, metadata: metadata, enabled_experiments: enabled_experiments, statsig_stable_id: statsig_stable_id)
        elsif CDO.rack_env?(:production) || managed_test_environment
          log_statsig_event_with_cdo_user(user: user, event_name: event_name, event_value: event_value, metadata: metadata, enabled_experiments: enabled_experiments, statsig_stable_id: statsig_stable_id)
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
      private def log_statsig_event_with_cdo_user(user:, event_name:, event_value:, metadata:, enabled_experiments:, statsig_stable_id:)
        statsig_user = build_statsig_user(user: user, enabled_experiments: enabled_experiments, statsig_stable_id: statsig_stable_id)
        log_statsig_event(statsig_user: statsig_user, event_name: event_name, event_value: event_value, metadata: metadata)
      end

      private def log_statsig_event(statsig_user:, event_name:, event_value:, metadata:)
        # Re-initialize Statsig to make sure it's available in current thread.
        Cdo::StatsigInitializer.init
        Statsig.log_event(statsig_user, event_name, event_value, metadata)
      end

      # Builds a StatsigUser object from a user entity
      private def build_statsig_user(user:, enabled_experiments:, statsig_stable_id:)
        user_params = {
          user_id: '',
          custom: {
            geRegion: Cdo::GlobalEdition.current_region,
          },
          custom_ids: {
            # The +stableID+ key must be a string,
            # allowing +StatsigUser#to_hash_without_stable_id+ to exclude it from the resulting hash.
            # See: https://github.com/statsig-io/ruby-sdk/blob/1.33.2/lib/statsig_user.rb#L124-L126
            'stableID' => statsig_stable_id,
          },
        }

        if user.present?
          user_params[:user_id] = user.id.to_s
          user_params[:custom_ids].merge!(
            user_type: user.user_type,
            enabled_experiments: enabled_experiments,
          )
        end

        StatsigUser.new(user_params)
      end

      # Logs an event to stdout, useful for development and debugging
      private def log_event_to_stdout(user:, event_name:, event_value:, metadata:, enabled_experiments:, statsig_stable_id:)
        event_details = {
          **build_statsig_user(
            user: user,
            enabled_experiments: enabled_experiments,
            statsig_stable_id: statsig_stable_id,
          ).serialize(true),
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
