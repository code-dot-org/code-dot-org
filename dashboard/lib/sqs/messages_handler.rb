module SQS
  # Defines the interface for a queued messages handler.
  class MessagesHandler
    # Handles an array of queue messages. If this method raises an exception, the
    # queue may retry it depending on its configuration.
    # @param <Array<SQS::Message>> messages
    def handle(messages)
      raise 'Handle must be implemented by subclasses'
    end
  end
end
