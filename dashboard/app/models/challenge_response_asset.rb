# == Schema Information
#
# Table name: challenge_response_assets
#
#  id                    :bigint           not null, primary key
#  challenge_response_id :bigint           not null
#  asset_type            :string(255)      not null
#  created_at            :datetime         not null
#  updated_at            :datetime         not null
#
# Indexes
#
#  index_challenge_response_assets_on_challenge_response_id  (challenge_response_id)
#
class ChallengeResponseAsset < ApplicationRecord
  belongs_to :challenge_response

  # whiteboard_image / video / audio.
  enum asset_type: {
    whiteboard_image: 'whiteboard_image',
    video: 'video',
    audio: 'audio',
  }, _prefix: :asset

  validates :asset_type, presence: true
end
