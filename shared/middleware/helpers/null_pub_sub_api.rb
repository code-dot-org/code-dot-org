# Base class that defines an interface for publishing messages to a Pubsub
# system. This class does nothing other than record the published messages
# for testing.  Real implementations should provide actual behavior for
# publish.
class NullPubSubApi
  @@published_messages = []

  # Publishes an event to a a channel using the Pub/Sub system.
  #
  # @param [String] channel a single channel name that the event is to be published on
  # @param [String] event - the name of the event to be triggered
  # @param [Hash] data - the data to be sent with the event
  def self.publish(channel, event, data)
    @@published_messages << [channel, event, data]
  end

  def self.published_messages
    @@published_messages
  end
end
