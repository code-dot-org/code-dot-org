# An SQS messages handler for asynchronous user level progress operations. These
# include activities and user_level updates.

class AsyncProgressHandler

  # Returns a thread-local SQS queue for handle asynchronous user progress operations
  # (Activity and UserLevel updates.) The queue is thread-local because the SQS client
  # is not thread-safe.
  def AsyncProgressHandler.progress_queue
    Thread.current['progress_queue'] ||=
      SQS::SQSQueue.new(Aws::SQS::Client.new, CDO.activity_queue_url)
  end

  def handle(messages)
    ActiveRecord::Base.transaction do
      messages.each do |message|
        op = JSON.parse(message.body)
        case op['model']
          when 'Activity'
            Activity.handle_async_op(op)
          when 'User'
            User.handle_async_op(op)
          else
            raise "Unexpected model #{op['model']} in #{op}"
        end
      end
    end
  end

end
