module SQS

  # An abstract base class for processing a batch of messages.
  # Implementers should subclass from this class and override `perform`.
  class MessagesHandler
    # Handles an array of SQS messages.  If this method raises an exception, the
    # operation will be retried according to the queue configuration.
    # @param <Array<Aws::SQS::Message>> messages
    def handle(messages)
      raise 'Handle must be implemented by subclasses'
    end
  end

end
