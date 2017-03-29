require 'sqs/sqs_queue'

# An SQS messages handler for asynchronous workshop jobs,
# notably wrapping up a workshop when it ends (sending emails, generating reports, etc.)
class Pd::AsyncWorkshopHandler
  ACTIONS = [
    ACTION_END = 'end'.freeze
  ].freeze

  def self.process_workshop(workshop_id, action)
    raise "Unexpected action #{action}" unless ACTIONS.include? action

    op = {
      workshop_id: workshop_id,
      action: action
    }

    # Test and Production should always have a pd_workshop_queue_url,
    # and enqueue the job in SQS
    if Rails.env.production? || Rails.env.test?
      raise "CDO.pd_workshop_queue_url is required on #{Rails.env}" unless CDO.pd_workshop_queue_url
      workshop_queue.enqueue(op.to_json)
    elsif CDO.pd_workshop_queue_url
      # Other environments may have it specified (e.g. adhoc), but it's not required.
      workshop_queue.enqueue(op.to_json)
    else
      # Otherwise perform the job immediately (e.g. on development)
      handle_operation(op)
    end
  end

  def self.process_ended_workshop(workshop_id)
    process_workshop(workshop_id, ACTION_END)
  end

  # Returns a thread-local SQS queue for handling asynchronous workshop operations
  # The queue is thread-local because the SQS client is not thread-safe.
  def self.workshop_queue
    Thread.current['pd_workshop_queue'] ||=
      SQS::SQSQueue.new(Aws::SQS::Client.new, CDO.pd_workshop_queue_url)
  end

  def self.handle_operation(op)
    case op[:action]
      when ACTION_END
        Pd::Workshop.process_ended_workshop_async(op[:workshop_id])
      else
        raise "Unexpected action #{op[:action]} in #{op}"
    end
  rescue Exception => exception
    # Notify honeybadger when an error occurs.
    Honeybadger.notify(exception,
      error_message: "Error processing Pd workshop: #{exception.message}",
      context: {op: op}
    )
    raise exception
  end

  def handle(messages)
    messages.each do |message|
      op = JSON.parse(message.body).symbolize_keys
      self.class.handle_operation(op)
    end
  end
end
