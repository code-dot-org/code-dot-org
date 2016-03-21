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

  def self.notify(room, message, options={})
    message(room, message, options.merge(notify: true))
  end

  def self.slackify(message)
    # format with slack markdownish formatting instead of html
    # https://slack.zendesk.com/hc/en-us/articles/202288908-Formatting-your-messages
    message.strip!
    message = "```#{message[7..-1]}```" if message =~ /^\/quote /
    message.gsub(/<\/?b>/, '*').gsub(/<\/?pre>/, '```').gsub(/<a href=['"]([^'"]+)['"]>/, '<\1|').gsub(/<\/a>/, '>')
  end

  # If CDO.hip_chat_logging is true, post message to hipchat with
  # exponential backoff, retrying at most `max_retries` times.
  # Otherwise log to CDO.log.
  #
  # Implementation notes: The synchronous post with exponential
  # backoff is done on a newly spawned thread to avoid blocking the
  # main Ruby thread.  This is OK for current usage because we log to
  # Hipchat infrequently.
  def self.post_to_hipchat(room, message, options={})
    unless CDO.hip_chat_logging
      # Output to standard log if HipChat isn't configured
      CDO.log.info("#{room}: #{message}")
      return
    end

    # Make the initial request synchronously.
    begin
      succeeded = post_hipchat_form(room, message, options).is_a?(Net::HTTPSuccess)
    rescue  # Handle timeouts and other exceptions gracefully.
      succeeded = false
    end
    return if succeeded

    # If that failed, back off exponentially and retry, working
    # on a thread to avoid stalling the main thread.
    @@current_retry_thread_for_test = Thread.new do
      backoff = @@initial_backoff
      retries = 1
      while !succeeded && retries <= MAX_RETRIES
        @@total_backoff_for_test += backoff
        @@retries_for_test += 1
        sleep(backoff)
        retries += 1
        backoff *= 2  # Exponentially back off.
        succeeded = post_hipchat_form(room, message, options).is_a?(Net::HTTPSuccess)
      end

      if !succeeded
        CDO.log.info("#{room}: #{message}")
        CDO.log.info('^^^ Unable to post message to HipChat due to repeated errors')
      end
    end
  end

  def self.post_hipchat_form(room, message, options)
    body = message.to_s
    if body.length > MAX_MESSAGE_SIZE
      # trim to 10000 chars, including some space for our truncation prefix
      body = TRUNCATION_PREFIX + body.slice(-MAX_MESSAGE_SIZE + TRUNCATION_PREFIX.length, MAX_MESSAGE_SIZE)
    end
    uri = URI.parse('http://api.hipchat.com/v1/rooms/message')
    Net::HTTP.post_form(
        uri,
        {color: 'gray'}.merge(options).merge({
                                                 from: @@name,
                                                 auth_token: @@auth_token,
                                                 room_id: room.to_s,
                                                 message: body
                                             }))
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

end
