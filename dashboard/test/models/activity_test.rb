require 'test_helper'

require 'securerandom'
require 'sqs/synchronous_queue'
require 'timecop'

class ActivityTest < ActiveSupport::TestCase

  # A test handler which allows deferred handling of asynchronous messages.
  # It records the messages it is alled with an then calls the underlying
  # AsyncActivityHandler when `run_queued_messages` is called.
  class DeferredActivityHandler
    def initialize
      @messages = []
      @activity_handler = Activity::AsyncHandler.new
    end

    def handle(messages)
      @messages += messages
    end

    def execute_async_writes
      @activity_handler.handle(@messages)
      @messages.clear
    end
  end

  def test_create_async!
    handler = DeferredActivityHandler.new
    queue = SQS::SynchronousQueue.new(handler)

    time = Time.local(2015, 1, 1, 0, 0, 0)

    activity = student = level = level_source = nil
    Timecop.freeze(time) do
      student = create :student
      level = create :applab
      level_source = LevelSource.find_identical_or_create(level, SecureRandom.uuid)
      activity = Activity.create_async!(queue,
                                        {level: level,
                                         user: student,
                                         level_source: level_source})
    end

    # The new activity returned by create_async doesn't have an id or timestamps yet, but it does
    # have other attributes.
    assert_nil activity.id
    assert_equal time, activity.created_at
    assert_equal time, activity.updated_at
    assert_equal student.id, activity.user_id
    assert_equal level.id, activity.level_id
    assert_equal level_source.id, activity.level_source_id

    # We shouldn't be able to find the activity in the database
    # because the async write hasn't happened yet.
    activity_finder = Activity.
        where(user_id: student.id).
        where(level_id: level.id).
        where(level_source_id: level_source.id)

    assert_nil activity_finder.first

    new_time = time + 1
    Timecop.freeze(new_time) do
      # Now let the database write proceed and make sure the correct data was written.
      handler.execute_async_writes
    end

    saved_activity = activity_finder.first
    assert_not_nil saved_activity.id
    assert_equal time, saved_activity.created_at

    assert_equal new_time, saved_activity.updated_at
    assert_equal student.id, saved_activity.user_id
    assert_equal level.id, saved_activity.level_id
    assert_equal level_source.id, saved_activity.level_source_id
  end

end
