# == Schema Information
#
# Table name: challenge_response_reactions
#
#  id                    :bigint           not null, primary key
#  challenge_response_id :bigint           not null
#  user_id               :integer          not null
#  emoji                 :string(255)      not null
#  created_at            :datetime         not null
#  updated_at            :datetime         not null
#
# Indexes
#
#  index_challenge_response_reactions_on_challenge_response_id  (challenge_response_id)
#  index_challenge_response_reactions_on_response_user_emoji    (challenge_response_id,user_id,emoji) UNIQUE
#  index_challenge_response_reactions_on_user_id               (user_id)
#
class ChallengeResponseReaction < ApplicationRecord
  belongs_to :challenge_response
  belongs_to :user

  # The reaction vocabulary, stored by name. The gallery frontend maps each
  # name to a glyph; keeping a fixed, controlled set keeps the emoji column a
  # short, index-friendly token instead of arbitrary unicode, and lets both
  # ends agree on which reactions exist. Order here is the order chips render
  # in (see ChallengeResponse#reaction_summary).
  EMOJIS = %w[clap fire smile heart party trophy].freeze

  validates :emoji, presence: true, inclusion: {in: EMOJIS}
  # Mirrors the unique index: a user may leave several different emoji on a
  # response, but not the same emoji twice.
  validates :user_id, uniqueness: {scope: [:challenge_response_id, :emoji]}
end
