require 'test_helper'
require 'sqs/sqs_queue'

class SqsQueueTest < ActiveSupport::TestCase

  def test_enqueue
    queue_url = 'https://example.com/fake_queue'
    body = 'fake_body'
    mock_sqs_client = mock('mock_sqs_client')
    mock_sqs_client.expects(:send_message).
        with(has_entries(queue_url: queue_url, message_body: body))

    queue = SQS::SQSQueue.new(mock_sqs_client, queue_url)
    queue.enqueue(body)
  end

end
