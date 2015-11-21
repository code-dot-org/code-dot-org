require 'test_helper'
require 'sqs/synchronous_queue'

class SynchronousQueueTest < ActiveSupport::TestCase

  # A test handler which captures the messages it receives.
  class TestHandler
    attr_reader :messages

    def handle(messages)
      @messages = messages
    end
  end

  # A broken handler class that doesn't implement handle.
  class BrokenHandler
    def quack(messages)
    end
  end

  def test_enqueue
    handler = TestHandler.new
    queue = SQS::SynchronousQueue.new(handler)

    body = 'test body'
    queue.enqueue(body)

    assert_equal 1, handler.messages.size
  end

  def test_raises_on_invalid_handler
    assert_raises(ArgumentError) {
      SQS::SynchronousQueue.new(BrokenHandler.new)
    }
  end
end

