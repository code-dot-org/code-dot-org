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
    message(CDO.hip_chat_log_room, message, options) if CDO.hip_chat_logging
  end

  def self.message(room, message, options={})
    uri = URI.parse('http://api.hipchat.com/v1/rooms/message')
    response = Net::HTTP.post_form(uri, ({
      color: 'gray',
    }).merge(
      options
    ).merge({
      from: @@name,
      auth_token: @@auth_token,
      room_id: room.to_s,
      message: message.to_s,
    }))

    channel = '#general' if room.to_s == 'developers'
    channel ||= "\##{room}"
    Slack.message slackify(message.to_s), channel:channel, username:@@name

    #sleep(0.10)
  end

  def self.notify(room, message, options={})
    message(room, message, options.merge(notify: true))
  end

  def self.slackify(message)
    # format with slack markdownish formatting instead of html
    # https://slack.zendesk.com/hc/en-us/articles/202288908-Formatting-your-messages
    message.strip!
    message = "```#{message[7..-1]}```" if message =~ /^\/quote /
    message.gsub(/<\/?b>/, '*')
  end

end
