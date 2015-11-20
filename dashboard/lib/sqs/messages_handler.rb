module SQS

  # An abstract base class for processing a batch of messages.
  # Handler implementers should subclass this class and override `handle`.
  class MessagesHandler
    # Handles an array of message bodies.  If this method raises an exception, the
    # operation will be retried according to the queue configuration.
    # @param <Array<SQS::Message>> messages
    def handle(messages)
      raise 'Handle must be implemented by subclasses'
    end
  end

  # A message with a body.
  # We don't expose the full underlying SQS message body to avoid introducing hard dependencies on SQS-specific
  # features in handlers.
  class Message
    attr_reader :body

    def initialize(body)
      @body = body
    end

    def to_s
      body
    end
  end
end
