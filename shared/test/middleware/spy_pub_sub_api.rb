# Test-only pub/sub API that sense whether events have been published without
# actually contacting a remote service.
class SpyPubSubApi
  attr_reader :publish_history

  def initialize
    @publish_history = []
  end

  # Pretends to publish an event to a a channel using the Pub/Sub system.
  #
  # @param [String] channel a single channel name that the event is to be published on
  # @param [String] event - the name of the event to be triggered
  # @param [Hash] data - the data to be sent with the event
  def publish(channel, event, data)
    @publish_history.push({channel: channel, event: event, data: data})
  end
end
