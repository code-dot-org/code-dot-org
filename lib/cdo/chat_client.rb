require 'net/http'
require 'net/http/responses'
require 'uri'
require 'cdo/slack'

class ChatClient
  @@name = CDO.name[0..14]

  def self.developers(message, options={})
    # Temporarily redirect developer logging to 'Server operations'.
    # TODO(dave): rename or split HipChat.developers once we settle on a HipChat
    # logging strategy.
    message('server operations', message, options)
  end

  def self.log(message, options={})
    message(CDO.hip_chat_log_room, message, options)
  end

  def self.message(room, message, options={})
    post_to_hipchat(room, message, options)

    channel = "\##{Slack::CHANNEL_MAP[room] || room}"
    Slack.message message.to_s, channel: channel, username: @@name, color: options[:color]
  end

  # TODO(asher): Deprecate this method. There appears to be a test dependency
  # on this CDO.log.info output happening.
  def self.post_to_hipchat(room, message, options={})
    unless CDO.hip_chat_logging
      # Output to standard log if HipChat isn't configured
      CDO.log.info("[#{room}] #{message}")
      return
    end
  end

  def self.wrap(name)
    start_time = Time.now
    ChatClient.log "Running #{name}..."
    yield if block_given?
    ChatClient.log "#{name} succeeded in #{RakeUtils.format_duration(Time.now - start_time)}"
  rescue => e
    # notify developers room and our own room
    "<b>#{name}</b> failed in #{RakeUtils.format_duration(Time.now - start_time)}".tap do |message|
      ChatClient.log message, color: 'red', notify: 1
      ChatClient.developers message, color: 'red', notify: 1
    end
    # log detailed error information in our own room
    ChatClient.log "/quote #{e}\n#{CDO.backtrace e}", message_format: 'text'
    raise
  end
end
