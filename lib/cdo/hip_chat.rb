require 'net/http'
require 'net/http/responses'
require 'uri'
require 'cdo/slack'

class HipChat
  # Initial backoff in seconds for Hipchat retries.
  # Immutable except for test.
  @@initial_backoff = 1.0

  @@auth_token = CDO.hipchat_secret
  @@name = CDO.name[0..14]

  # The number of exponential backoff retries.
  @@retries_for_test = 0

  # The total time spent waiting in exponential backoff retries.
  @@total_backoff_for_test = 0.0

  # Used to track the most recent exponential backoff thread for tests.
  @@current_retry_thread_for_test = nil

  # Maximum times to retry on test failure
  MAX_RETRIES = 3

  TRUNCATION_PREFIX = '[TRUNCATED]'
  MAX_MESSAGE_SIZE = 10000

  def self.developers(message, options={})
    # temporarily redirect developer logging to 'Server operations'.
    # TODO(dave): rename or split HipChat.developers once we settle on a HipChat logging strategy.
    message('server operations', message, options)
  end

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
      CDO.log.info(message.to_s)
      return
    end
  end

  # Wait the current HipChat request to succeeed (possibly including retries).
  def self.await_retries_for_test
    @@current_retry_thread_for_test.join if @@current_retry_thread_for_test
  end

  # Returns the number of HipChat POST retries, for testing only.
  def self.retries_for_test
    @@retries_for_test
  end

  # Returns the total time spent waiting in exponential backoff retries,
  # for testing only.
  def self.total_backoff_for_test
    @@total_backoff_for_test
  end

  # Resets the number of HipChat POST retries, for testing only.
  def self.reset_test_statistics
    @@retries_for_test = 0
    @@total_backoff_for_test = 0.0
  end

  # Set the initial exponential backoff interval, for testing only.
  def self.set_backoff_for_test(backoff)
    @@initial_backoff = backoff
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
