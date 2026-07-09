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

  # The frontend-facing shape of a response and its assets.
  # @param assets_for_upload [Boolean] when true, each asset carries a presigned
  #   upload URL (used right after create); otherwise a presigned download URL.
  def summarize(assets_for_upload: false)
    {
      id: id,
      challenge_id: challenge_id,
      user_id: user_id,
      student_text: student_text,
      transcript: transcript,
      student_feedback: student_feedback,
      evaluation_result: evaluation_result,
      is_final: is_final,
      evaluated_at: evaluated_at,
      created_at: created_at,
      assets: challenge_response_assets.map {|asset| asset.summarize(upload: assets_for_upload)},
    }
  end
end
