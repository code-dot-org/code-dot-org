# Interface to fake interactions with a PubSub system, like Pusher
# Should respond to same messages as PusherApi

class NullPubSubApi
  def self.configure_keys

  end

  def self.trigger(channels, event, data)
  end
end
