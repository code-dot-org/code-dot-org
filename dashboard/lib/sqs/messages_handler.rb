module SQS

  # An abstract base class for processing a batch of messages.
  # Handler implementers should subclass this class and override `handle`.
  class MessagesHandler
    # Handles an array of message bodies.  If this method raises an exception, the
    # operation will be retried according to the queue configuration.
    # @param <Array<String>> messages
    def handle(bodies)
      raise 'Handle must be implemented by subclasses'
    end
  end

end
