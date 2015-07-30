# Base class that defines an interface for publishing messages to a Pubsub
# system. This class does nothing other than counting the number of
# publish calls, real implementations should provide actual behavior for
# publish.
class NullPubSubApi
  @@publish_count = 0

  # Publishes an event to a a channel using the Pub/Sub system.
  #
  # @param [String] channel a single channel name that the event is to be published on
  # @param [String] event - the name of the event to be triggered
  # @param [Hash] data - the data to be sent with the event
  def self.publish(channel, event, data)
    @@publish_count += 1
  end

  def self.publish_count
    @@publish_count
  end
end
