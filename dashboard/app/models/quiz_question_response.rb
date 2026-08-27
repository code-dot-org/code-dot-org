# == Schema Information
#
# Table name: quiz_question_responses
#
#  id                 :bigint           not null, primary key
#  quiz_attempt_id    :bigint           not null
#  quiz_question_id   :bigint           not null
#  response_data      :json             not null
#  max_score          :integer
#  score              :integer
#  grading_status     :string(255)      not null
#  time_spent_seconds :integer
#  created_at         :datetime         not null
#  updated_at         :datetime         not null
#
# Indexes
#
#  index_quiz_question_responses_on_attempt_and_question  (quiz_attempt_id,quiz_question_id) UNIQUE
#  index_quiz_question_responses_on_quiz_attempt_id       (quiz_attempt_id)
#  index_quiz_question_responses_on_quiz_question_id      (quiz_question_id)
#
class QuizQuestionResponse < ApplicationRecord
  belongs_to :quiz_attempt
  belongs_to :quiz_question

  GRADING_STATUSES = %w(
    auto_graded
    pending_ai
    pending_manual
    ai_graded
    teacher_graded
    ungraded
  ).freeze
  validates :grading_status, inclusion: {in: GRADING_STATUSES}
  # MultipleChoiceQuestion#grade explicitly treats {} as a valid
  # "skipped" response (score 0, not an error), and QuizAttempt#question_results
  # expects exactly one response row per question whether or not it was answered.
  # Only nil (the column missing entirely) should be rejected.
  validates :response_data, exclusion: {in: [nil], message: "can't be nil"}
end
