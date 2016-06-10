# An SQS messages handler for asynchronous workshop jobs,
# notably wrapping up a workshop when it ends (sending emails, generating reports, etc.)
class Pd::AsyncWorkshopHandler
  ACTIONS = [
    ACTION_CLOSE = 'close'
  ]

  def self.process_workshop(workshop_id, action)
    raise "Unexpected action #{action}" unless ACTIONS.include? action

    op = {
      workshop_id: workshop_id,
      action: action
    }

    # Test and Production should always have a pd_workshop_queue_url,
    # and enqueue the job in SQS
    if CDO.pd_workshop_queue_url
      self.workshop_queue.enqueue(op.to_json)
    else
      # Otherwise perform the job immediately (e.g. on development)
      self.handle_operation(op)
    end
  end

  def self.process_closed_workshop(workshop_id)
    self.process_workshop(workshop_id, ACTION_CLOSE)
  end

  # Returns a thread-local SQS queue for handling asynchronous workshop operations
  # The queue is thread-local because the SQS client is not thread-safe.
  def self.workshop_queue
    Thread.current['pd_workshop_queue'] ||=
      SQS::SQSQueue.new(Aws::SQS::Client.new, CDO.pd_workshop_queue_url)
  end

  def self.handle_operation(op)
    case op[:action]
      when ACTION_CLOSE
        Pd::Workshop.process_closed_workshop_async(op[:workshop_id])
      else
        raise "Unexpected action #{op[:action]} in #{op}"
    end
  end

  def handle(messages)
    messages.each do |message|
      op = JSON.parse(message.body).symbolize_keys
      self.class.handle_operation(op)
    end
  end
end
