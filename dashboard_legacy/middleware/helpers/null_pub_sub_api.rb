# Base class that defines an interface for publishing messages to a Pubsub
# system. This class does nothing, derived classes should override publish
# with actual behavior

class NullPubSubApi
  # Publishes an event to a a channel using the Pub/Sub system.
  #
  # @param [String] channel a single channel name that the event is to be published on
  # @param [String] event - the name of the event to be triggered
  # @param [Hash] data - the data to be sent with the event
  def publish(channel, event, data)
  end
end
