# == Schema Information
#
# Table name: quiz_attempts
#
#  id             :bigint           not null, primary key
#  user_id        :integer          not null
#  level_id       :integer          not null
#  unit_id        :integer          not null
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
#  index_quiz_attempts_on_level_id                 (level_id)
#  index_quiz_attempts_on_unit_id                  (unit_id)
#  index_quiz_attempts_on_user_id                  (user_id)
#  index_quiz_attempts_on_user_level_unit_attempt  (user_id,level_id,unit_id,attempt_number) UNIQUE
#
class QuizAttempt < ApplicationRecord
  belongs_to :user
  belongs_to :level
  belongs_to :unit, class_name: 'Unit'

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

  # How long after expires_at a response write is still accepted - covers
  # the client's own legitimate auto-submit.
  RESPONSE_GRACE_PERIOD = 30.seconds

  def response_deadline_passed?
    expires_at.present? && Time.now > expires_at + RESPONSE_GRACE_PERIOD
  end

  # Whether a NEW attempt could be started after this one. Only meaningful
  # once this attempt is submitted - an in-progress attempt should be
  # resumed, not retaken. max_attempts blank means unlimited once
  # allow_multiple_attempts is true.
  def retakeable?
    return false if submitted_at.blank?
    return false unless level.allow_multiple_attempts?
    level.max_attempts.blank? || attempt_number < level.max_attempts.to_i
  end

  # Per-question review data, once submitted - nil beforehand.
  # One entry per response recorded for this attempt - a skipped question
  # still has one, since the client posts a response for every question on
  # submit, so it shows as incorrect rather than missing.
  def question_results
    return nil if submitted_at.blank?

    # Only questions on this quiz count - mirrors the same filter used when
    # totaling score/max_score on finalize.
    in_quiz_question_ids = QuizLevelQuestion.where(level_id: level_id).select(:quiz_question_id)
    quiz_question_responses.where(quiz_question_id: in_quiz_question_ids).includes(:quiz_question).map do |response|
      reveal_answer = level.show_correctness? && level.reveal_answer_explanation?
      # Pending/manual/ungraded responses have no score yet - report nil rather than false,
      # or an ungraded response would be shown to the student as incorrect.
      graded = response.score.present? && response.max_score.present?
      {
        quiz_question_id: response.quiz_question_id,
        selected_choice_id: response.response_data['selectedChoiceId'],
        correct: (level.show_correctness? && graded) ? response.score == response.max_score : nil,
        explanation: reveal_answer ? response.quiz_question.explanation : nil,
        correct_choice_id: reveal_answer ? response.quiz_question.content['correct_choice_id'] : nil
      }
    end
  end
end
