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

  # Creates a new Activity which will be written eventually to the database. (Note that the id is
  # nil because it may not have been written yet.) An exception will be thrown if the object does
  # not pass validation. The object is only written asynchronously if the gatekeeper allows it for
  # this hostname.
  def Activity.create_async!(attributes)
    activity = Activity.new(attributes)
    activity.created_at = activity.updated_at = Time.now
    activity.validate!
    async_op = {'model' => 'Activity', 'action' => 'create', 'attributes' => activity.attributes}
    if Gatekeeper.allows('async_activity_writes', where: {hostname: Socket.gethostname})
      progress_queue.enqueue(async_op.to_json)
    else
      Activity.handle_async_op(async_op)
    end
    activity
  end

  # Handle an async operation created by create_async! (and other async operations we might add
  # in the future).
  # @param [Hash] op A has describing the operation
  def Activity.handle_async_op(op)
    raise 'Model must be Activity' if op['model'] != 'Activity'

    case op['action']
      when 'create'
        attributes = op['attributes']
        attributes[:updated_at] = Time.now
        Activity.create!(attributes)
      else
        raise "Unknown action #{op['action']} in #{async_json}"
    end
  end

  def Activity.progress_queue
    AsyncProgressHandler.progress_queue
  end

end
