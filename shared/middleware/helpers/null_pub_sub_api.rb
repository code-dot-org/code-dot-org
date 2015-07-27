# Base class that defines an interface for publishing messages to a Pubsub
# system. This class does nothing, derived classes should override publish
# with actual behavior

class NullPubSubApi
  def self.trigger(channels, event, data)
  end
end
