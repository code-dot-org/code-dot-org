# == Schema Information
#
# Table name: challenge_responses
#
#  id                :bigint           not null, primary key
#  challenge_id      :bigint           not null
#  user_id           :integer          not null
#  modality          :string(255)
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

  # What the student actually used: whiteboard / video / both. Nullable.
  enum modality: {
    whiteboard: 'whiteboard',
    video: 'video',
    both: 'both',
  }, _prefix: :modality
end
