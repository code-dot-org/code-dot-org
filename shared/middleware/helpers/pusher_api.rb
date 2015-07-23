# Interface to interact with Pusher.com
# Should respond to same messages as NullPubSubApi

require 'pusher'

class PusherApi
  def self.configure_keys
    Pusher.app_id = CDO.pusher_app_id
    Pusher.key = CDO.pusher_application_key
    Pusher.secret = CDO.pusher_application_secret
  end

  def self.trigger(channels, event, data)
    Pusher.trigger(channels, event, data)
  end
end
