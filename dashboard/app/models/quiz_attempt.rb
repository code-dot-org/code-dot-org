# == Schema Information
#
# Table name: quiz_attempts
#
#  id             :bigint           not null, primary key
#  user_id        :integer          not null
#  level_id       :integer          not null
#  script_id      :integer          not null
#  attempt_number :integer          not null
#  started_at     :datetime         not null
#  submitted_at   :datetime
#  score          :integer
#  max_score      :integer
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
#
# Indexes
#
#  index_quiz_attempts_on_level_id                   (level_id)
#  index_quiz_attempts_on_script_id                  (script_id)
#  index_quiz_attempts_on_user_level_script_attempt  (user_id,level_id,script_id,attempt_number) UNIQUE
#
class QuizAttempt < ApplicationRecord
  belongs_to :user
  belongs_to :level
  # The "Script" concept is implemented by the Unit model (scripts table).
  belongs_to :script, class_name: 'Unit'

  has_many :quiz_question_responses, dependent: :destroy

  validates :attempt_number, presence: true
  validates :started_at, presence: true

  # nil when the quiz has no time limit.
  def expires_at
    return nil if level.time_limit_minutes.blank?
    started_at + level.time_limit_minutes.to_i.minutes
  end

  def expired?
    expires_at.present? && Time.now > expires_at
  end

  # Whether a NEW attempt could be started after this one. Only meaningful
  # once this attempt is submitted - an in-progress attempt should be
  # resumed, not retaken. max_attempts blank means unlimited once
  # allow_multiple_attempts is true - see Quiz#max_attempts_requires_allow_multiple_attempts.
  def retakeable?
    return false if submitted_at.blank?
    return false unless level.allow_multiple_attempts?
    level.max_attempts.blank? || attempt_number < level.max_attempts.to_i
  end
end
