module SQS
  # A queue implementation backed by SQS. Assumes a queue processor to eventually
  # handle the queued messages.
  class SQSQueue
    attr_reader :queue_url, :sqs_client

    def initialize(sqs_client, queue_url)
      raise ArgumentError if sqs_client.nil? || queue_url.nil?
      @sqs_client = sqs_client
      @queue_url = queue_url
    end

    def enqueue(message_body)
      Rails.logger.debug "Queueing #{message_body} to #{queue_url}"
      @sqs_client.send_message(queue_url: queue_url, message_body: message_body)
    end
  end
end
