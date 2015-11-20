require 'test_helper'
require 'minitest/autorun'
require 'aws-sdk'
require 'fake_sqs/test_integration'

require 'sqs/queue_processor'
require 'sqs/queue_processor_config'

# Launch a fake SQS service running on Localhost.
Aws.config.update(region: 'us-east-1')
$fake_sqs_service = FakeSQS::TestIntegration.new(
  database: ':memory:',
  sqs_endpoint: 'localhost',
  sqs_port: 4568,
)

class QueueProcessorTest < ActiveSupport::TestCase

  # A fake handler that adds a configurable latency to each request and records all of
  # of the messages received across instances in a class variable.
  class RecordingHandler
    # Lock to protect class state for recording messages.
    @@lock = Mutex.new

    # An array of all of the messages received by handler instances.
    @@messages = []

    # @return {Array<String>}
    attr_reader :messages

    def initialize(latency)
      @messages = []
      @latency = latency
    end

    def handle(messages)
      @@lock.synchronize {
        @messages += messages
      }
      sleep(@latency)
    end

    # @return [Array<String>] A snapshot of the messages handled by all instances
    # since the last call to reset
    def self.recorded_messages
      @@lock.synchronize {
        @@messages.dup
      }
    end

    def self.reset
      @@lock.synchronize {
        @@messages = []
      }
    end
  end

  def setup
    $fake_sqs_service.start
    @sqs = Aws::SQS::Client.new
    @sqs.config.endpoint = $fake_sqs_service.uri
    RecordingHandler.reset

    @logger = Logger.new(STDOUT)
  end

  def teardown
    $fake_sqs_service.stop
  end

  def test_queue_processor
    response = @sqs.create_queue(queue_name: 'test-queue')
    queue_url = response.queue_url

    num_workers = 10
    global_max_messages_per_sec = 50

    handler = RecordingHandler.new(0)
    sqs_metrics = SQS::Metrics.new
    config = SQS::QueueProcessorConfig.new(
        queue_url: queue_url,
        handler: handler,
        initial_max_rate: global_max_messages_per_sec,
        dcdo_max_rate_key: 'test-max-rate',
        num_processors: 1,
        num_workers_per_processor: num_workers,
        logger: @logger)

    # Enqueue a bunch of messages on a thread with some burstiness
    num_messages = 300
    Thread.new do
      (1..num_messages).each do |message_index|
        @sqs.send_message(queue_url: queue_url, message_body: message_index.to_s)
        sleep 0.1 if (message_index % 30 == 0)
      end
    end

    # Start the queue processor.
    processor = SQS::QueueProcessor.new(config, sqs_metrics)
    processor.start

    start_time_sec = Time.now.to_f
    while sqs_metrics.successes.value < num_messages
      sleep 2
      @logger.info "Successes: #{sqs_metrics.successes.value}"
      @logger.info "Failures:  #{sqs_metrics.failures.value}"
    end

    processor.stop
  end

end
