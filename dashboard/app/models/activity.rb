# == Schema Information
#
# Table name: activities
#
#  id              :integer          not null, primary key
#  user_id         :integer
#  level_id        :integer
#  action          :string(255)
#  url             :string(255)
#  created_at      :datetime
#  updated_at      :datetime
#  attempt         :integer
#  time            :integer
#  test_result     :integer
#  level_source_id :integer
#  lines           :integer          default(0), not null
#
# Indexes
#
#  index_activities_on_level_source_id       (level_source_id)
#  index_activities_on_user_id_and_level_id  (user_id,level_id)
#

require 'cdo/activity_constants'

class Activity < ActiveRecord::Base
  include ActivityConstants

  belongs_to :level
  belongs_to :user
  belongs_to :level_source
  has_one :activity_hint
  has_many :experiment_activities

  def Activity.submitted?(result)
    return false if result.nil?
    (result == SUBMITTED_RESULT)
  end

  def Activity.best?(result)
    return false if result.nil?
    (result == BEST_PASS_RESULT)
  end

  def Activity.passing?(result)
    return false if result.nil?
    (result >= MINIMUM_PASS_RESULT)
  end

  def Activity.finished?(result)
    return false if result.nil?
    (result >= MINIMUM_FINISHED_RESULT)
  end

  def submitted?
    Activity.submitted? test_result
  end

  def best?
    Activity.best? test_result
  end

  def passing?
    Activity.passing? test_result
  end

  def finished?
    Activity.finished? test_result
  end

  def Activity.recent(limit)
    # yeah, this is a lot like .last -- but I want a dataset not an array
    Activity.order('id desc').limit(limit)
  end

  # Returns a new Activity and queues an SQS message to asynchronously create it in
  # the database. Note that the id in the return object will not be populated
  # because it has not been saved yet. The Activity must pass validation or an
  # exception will be thrown synchronously.
  def Activity.create_async!(queue, attributes)
    Activity.new(attributes).tap do |activity|
      activity.created_at = Time.now
      activity.updated_at = Time.now
      activity.validate!
      message_body = {
        'model' => 'Activity', 'action' => 'create', 'attributes' => activity.attributes
      }.to_json
      queue.enqueue(message_body)
    end
  end

  # Handle an async message body created by async_create! etc.
  # @param [String] json A JSON-encoded asynchronous operation.
  def Activity.handle_async_message_json(json)
    op = JSON::parse(json)

    if op['model'] != 'Activity'
      raise "Model must be Activity, but was #{op['model']} in #{json}"
    end

    case op['action']
      when 'create'
        attributes = op['attributes']
        attributes[:updated_at] = Time.now
        Activity.create!(attributes)
      else
        raise "Unknown action #{op['action']} in #{async_json}"
    end
  end

  # Helper handler class for handling a batch of async Activity messages.
  class AsyncHandler
    def handle(messages)
      messages.each do |message|
        Activity.handle_async_message_json(message.body)
      end
    end
  end

end
