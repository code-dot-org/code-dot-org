# == Schema Information
#
# Table name: challenge_responses
#
#  id                :bigint           not null, primary key
#  challenge_id      :bigint           not null
#  user_id           :integer          not null
#  student_text      :text(65535)
#  transcript        :text(65535)
#  student_feedback  :text(65535)
#  evaluation_result :json
#  is_final          :boolean          default(FALSE), not null
#  evaluated_at      :datetime
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#  evaluation_status :integer
#
# Indexes
#
#  index_challenge_responses_on_challenge_user_created  (challenge_id,user_id,created_at)
#  index_challenge_responses_on_user_id                 (user_id)
#
class ChallengeResponse < ApplicationRecord
  belongs_to :challenge
  belongs_to :user
  has_many :challenge_response_assets, dependent: :destroy

  # Lifecycle of the AI evaluation of this response. NULL means no evaluation
  # has been requested. The gap before FAILURE leaves room for more terminal
  # states and mirrors SharedConstants::RUBRIC_AI_EVALUATION_STATUS. The
  # violation states mean the student's text tripped the PII or profanity
  # filter, so no request was sent to the LLM.
  enum evaluation_status: {
    queued: 0,
    running: 1,
    success: 2,
    failure: 1000,
    pii_violation: 1001,
    profanity_violation: 1002,
  }, _prefix: :evaluation

  # A response can be evaluated once it is a final submission and every
  # declared asset has had its bytes uploaded to S3 (asset rows are created
  # before their bytes arrive, so a response with pending uploads is not yet
  # complete).
  def ready_for_evaluation?
    is_final && challenge_response_assets.all?(&:uploaded?)
  end

  # The frontend-facing shape of a response and its assets.
  # @param assets_for_upload [Boolean] when true (used right after create),
  #   assets carry no download URL since their bytes are not uploaded yet; the
  #   client PUTs them to /challenge_response_assets/:id/upload. Otherwise
  #   each asset carries a presigned download URL.
  # @param include_evaluation [Boolean] when true, includes the AI evaluation
  #   fields. Students do not see their evaluation until a teacher has
  #   reviewed it, so this is false for the response's owner and true for
  #   teachers.
  def summarize(assets_for_upload: false, include_evaluation: false)
    summary = {
      id: id,
      challenge_id: challenge_id,
      user_id: user_id,
      student_text: student_text,
      transcript: transcript,
      is_final: is_final,
      created_at: created_at,
      assets: challenge_response_assets.map {|asset| asset.summarize(upload: assets_for_upload)},
    }
    if include_evaluation
      summary[:student_feedback] = student_feedback
      summary[:evaluation_result] = evaluation_result
      summary[:evaluation_status] = evaluation_status
      summary[:evaluated_at] = evaluated_at
    end
    summary
  end
end
