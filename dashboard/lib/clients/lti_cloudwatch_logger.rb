require 'cdo/aws/cloudwatch_logs'

class LtiCloudWatchLogger
  ENV_SUFFIX = rack_env?(:adhoc) ? CDO.stack_name : rack_env
  LOG_GROUP_NAME = "LTI-#{ENV_SUFFIX}".freeze
  LOG_STREAM_NAME = ENV_SUFFIX

  def self.put_log_event(event)
    event_payload = {
      timestamp: (Time.now.to_f * 1000).to_i,
      message: event.to_json
    }

    Cdo::CloudWatchLogs.put_log_event(LOG_GROUP_NAME, LOG_STREAM_NAME, event_payload)
  end
end
