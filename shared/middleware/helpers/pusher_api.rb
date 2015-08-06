# Interface to interact with Pusher.com
# Should respond to same messages as NullPubSubApi

require 'pusher'

class PusherApi
  Pusher.app_id = CDO.pusher_app_id
  Pusher.key = CDO.pusher_application_key
  Pusher.secret = CDO.pusher_application_secret

  # Publishes an event to a a channel using the Pub/Sub system.
  #
  # @param [String] channel a single channel name that the event is to be published on
  # @param [String] event - the name of the event to be triggered
  # @param [Hash] data - the data to be sent with the event
  def self.publish(channel, event, data)
    Pusher.trigger(channel, event, data)
  end
end
