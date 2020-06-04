require 'aws-sdk-cloudwatchlogs'

module Cdo::CloudFormation
  # Overrides tail_events to monitor a specific CloudWatch Log during stack update.
  module TailLogs
    LOG_NAME = '/var/log/bootstrap.log'.freeze

    # Print the latest output from a CloudWatch Logs log stream, if present.
    def tail_events(start)
      super
      log_config = {
        log_group_name: stack_name,
        log_stream_name: LOG_NAME,
        start_from_head: true
      }
      if @log_token
        log_config[:next_token] = @log_token
      else
        log_config[:start_time] = start
      end
      # Return silently if we can't get the log events for any reason.
      resp = cw_logs.get_log_events(log_config) rescue return
      resp.events.map(&:message).each {|message| log.info(message)}
      @log_token = resp.next_forward_token
    end

    def cw_logs
      @cw_logs ||= Aws::CloudWatchLogs::Client.new
    end
  end
end
