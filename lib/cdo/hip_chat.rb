require 'net/http'
require 'uri'
require 'cdo/slack'

class HipChat

  @@auth_token = CDO.hipchat_secret
  @@name = CDO.name[0..14]

  def self.developers(message, options={})
    message(:developers, message, options)
  end

  def self.log(message, options={})
    message(CDO.hip_chat_log_room, message, options)
  end

  def self.message(room, message, options={})
    unless CDO.hip_chat_logging
      # Output to standard log if HipChat isn't configured
      CDO.log.info("#{room}: #{message}")
      return
    end
    uri = URI.parse('http://api.hipchat.com/v1/rooms/message')
    Net::HTTP.post_form(uri, ({
      color: 'gray',
    }).merge(
      options
    ).merge({
      from: @@name,
      auth_token: @@auth_token,
      room_id: room.to_s,
      message: message.to_s,
    }))

    channel = "\##{Slack::CHANNEL_MAP[room.to_sym] || room}"
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

end
