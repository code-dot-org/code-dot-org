require 'net/http'
require 'net/http/responses'
require 'uri'
require 'cdo/slack'

class HipChat
  @@name = CDO.name[0..14]

  TRUNCATION_PREFIX = '[TRUNCATED]'
  MAX_MESSAGE_SIZE = 10_000

  def self.log(message, options={})
    message(CDO.hip_chat_log_room, message, options)
  end

  def self.message(room, message, options={})
    post_to_hipchat(room, message, options)

    channel = "\##{Slack::CHANNEL_MAP[room] || room}"
    Slack.message slackify(message.to_s), channel: channel, username: @@name, color: options[:color]
  end

  def self.slackify(message)
    # format with slack markdownish formatting instead of html
    # https://slack.zendesk.com/hc/en-us/articles/202288908-Formatting-your-messages
    message.strip!
    message = "```#{message[7..-1]}```" if message =~ /^\/quote /
    message.
      gsub(/<\/?i>/, '_').
      gsub(/<\/?b>/, '*').
      gsub(/<\/?pre>/, '```').
      gsub(/<a href=['"]([^'"]+)['"]>/, '<\1|').
      gsub(/<\/a>/, '>').
      gsub(/<br\/?>/, "\n")
  end

  def self.post_to_hipchat(room, message, options={})
    unless CDO.hip_chat_logging
      # Output to standard log if HipChat isn't configured
      CDO.log.info("[#{room}] #{message}")
      return
    end
  end

  def self.wrap(name)
    start_time = Time.now
    HipChat.log "Running #{name}..."
    yield if block_given?
    HipChat.log "#{name} succeeded in #{RakeUtils.format_duration(Time.now - start_time)}"
  rescue => e
    # notify developers room and our own room
    "<b>#{name}</b> failed in #{RakeUtils.format_duration(Time.now - start_time)}".tap do |message|
      HipChat.log message, color: 'red', notify: 1
      HipChat.developers message, color: 'red', notify: 1
    end
    # log detailed error information in our own room
    HipChat.log "/quote #{e}\n#{CDO.backtrace e}", message_format: 'text'
    raise
  end
end
