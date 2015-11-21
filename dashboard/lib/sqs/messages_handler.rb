module SQS

  # An abstract base class for processing a batch of messages.
  # Handler implementers should subclass this class and override `handle`.
  class MessagesHandler
    # Handles an array of SQS messages.  If this method raises an exception, the
    # operation will be retried according to the queue configuration.
    # @param <Array<Aws::SQS::Message>> messages
    def handle(messages)
      raise 'Handle must be implemented by subclasses'
    end
  end

end
