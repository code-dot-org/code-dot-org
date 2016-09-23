# Interface to interact with Pusher.com
# Should respond to same messages as NullPubSubApi

require 'pusher'

class PusherApi
  def initialize
    @client = Pusher::Client.new(
      app_id: CDO.pusher_app_id,
      key: CDO.pusher_application_key,
      secret: CDO.pusher_application_secret
    )
    @client.timeout = 10 # seconds, as recommended by Pusher support
  end

  # Publishes an event to a a channel using the Pub/Sub system.
  #
  # @param [String] channel a single channel name that the event is to be published on
  # @param [String] event - the name of the event to be triggered
  # @param [Hash] data - the data to be sent with the event
  def publish(channel, event, data)
    @client.trigger(channel, event, data)
  end
end
