require 'net/http'
require 'uri'

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
    sleep(0.10)
  end

  def self.notify(room, message, options={})
    message(room, message, options.merge(notify: true))
  end

end
