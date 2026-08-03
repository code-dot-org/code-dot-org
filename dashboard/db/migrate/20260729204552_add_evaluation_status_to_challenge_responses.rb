class AddEvaluationStatusToChallengeResponses < ActiveRecord::Migration[7.0]
  # Tracks the lifecycle of the AI evaluation of a response (queued, running,
  # succeeded, failed, blocked by content filters). NULL means no evaluation
  # has been requested. The enum values are defined on ChallengeResponse in a
  # follow-up PR alongside the evaluation job; this migration ships separately
  # per our convention of keeping schema changes apart from feature work.
  def change
    add_column :challenge_responses, :evaluation_status, :integer
  end
end
