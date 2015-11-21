require 'sqs/message'

module SQS

  # A queue implementation which does no actual enqueueing but rather immediately
  # invokes a provided handler with the message.
  class SynchronousQueue

    def initialize(messages_handler)
      raise ArgumentError unless messages_handler.respond_to?(:handle)
      @messages_handler = messages_handler
    end

    def enqueue(message_body)
      @messages_handler.handle([SQS::Message.new(message_body)])
    end
  end

end
