# == Schema Information
#
# Table name: user_adaptive_steps
#
#  id                     :bigint           not null, primary key
#  user_level_id          :bigint           unsigned, not null
#  step_id                :string(255)      not null
#  progress               :json
#  validation_history     :json
#  generated_instructions :json
#  created_at             :datetime         not null
#  updated_at             :datetime         not null
#
# Indexes
#
#  index_user_adaptive_steps_on_user_level_id_and_step_id  (user_level_id,step_id) UNIQUE
#

# A student's state on one adaptive step; a level step's progress is its level's UserLevel.
class UserAdaptiveStep < ApplicationRecord
  data_classification(
    id: :confidential,
    user_level_id: :confidential,
    step_id: :confidential,
    progress: :confidential,
    validation_history: :confidential,
    generated_instructions: :confidential,
    created_at: :confidential,
    updated_at: :confidential,
  )

  belongs_to :user_level

  validates :step_id, presence: true

  def record_progress!(started: false, completed: false, seconds: nil, answers: nil, columns: {})
    with_lock do
      assign_attributes(columns)
      merged = progress || {}
      now = Time.zone.now.utc.iso8601
      merged['startedAt'] ||= now if started
      merged['completedAt'] ||= now if completed
      merged['timeSpent'] = (merged['timeSpent'] || 0) + seconds if seconds&.positive?
      if answers
        merged['answers'] = (merged['answers'] || {}).merge(answers)
        merged['submitted'] = true
      end
      # Any progress at all makes the step started, so a no-op save leaves it nil.
      self.progress = merged if merged.any?
      save!
    end
  end

  def progress_json
    return {} unless progress
    {
      'status' => progress['completedAt'] ? 'complete' : 'started',
      'timeSpent' => progress['timeSpent'] || 0,
    }.merge(progress.slice('startedAt', 'completedAt', 'submitted', 'answers'))
  end
end
