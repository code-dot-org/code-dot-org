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
