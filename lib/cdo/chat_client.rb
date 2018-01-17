require 'fileutils'
require 'net/http'
require 'net/http/responses'
require 'uri'
require 'cdo/slack'

# This class is intended to be a thin wrapper around our chat client
# implementation (namely Slack as of February 2017).
class ChatClient
  @@name = CDO.name[0..14]
  @@logger = nil

  def self.log(message, options={})
    message(CDO.slack_log_room, message, options)
  end

  # @param room [String] The room to post to which message should be posted.
  # @param message [String] The message to post. Can also be anything that
  #   responds to the method to_s.
  # @param options [Hash] An optional hash of options.
  #   color (optional): The color the message should be posted.
  # @return [Boolean] Whether the message was posted successfully.
  def self.message(room, message, options={})
    unless @@logger
      FileUtils.mkdir_p(deploy_dir('log'))
      @@logger = Logger.new(deploy_dir('log', 'chat_messages.log'))
    end
    @@logger.info("[#{room}] #{message}")

    unless CDO.hip_chat_logging
      return
    end

    Slack.message(
      message.to_s,
      channel: room,
      username: @@name,
      color: options[:color]
    )
  end

  def self.snippet(message)
    Slack.snippet(CDO.slack_log_room, message)
  end

  def self.wrap(name, backtrace: false)
    start_time = Time.now
    ChatClient.log "Running #{name}..."
    yield if block_given?
    ChatClient.log "#{name} succeeded in #{RakeUtils.format_duration(Time.now - start_time)}"
  rescue
    message = "<b>#{name}</b> failed in "\
      "#{RakeUtils.format_duration(Time.now - start_time)}"
    ChatClient.log message, color: 'red', notify: 1
    ChatClient.message 'server operations', message, color: 'red', notify: 1
    raise
  end
end
