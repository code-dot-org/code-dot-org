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
  has_many :challenge_response_reactions, dependent: :destroy

  # Lifecycle of the AI evaluation of this response. NULL means no evaluation
  # has been requested.
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

  # The frontend-facing shape of a response and its assets, including the
  # author's display name and the lesson's unit and position.
  # @param assets_for_upload [Boolean] when true (used right after create),
  #   assets carry no download URL since their bytes are not uploaded yet; the
  #   client PUTs them to /challenge_response_assets/:id/upload. Otherwise
  #   each asset carries a presigned download URL.
  # @param include_evaluation [Boolean] when true, includes the scored rubric
  #   evaluation. Scores are teacher-only.
  # @param include_feedback [Boolean] when false, omits student_feedback,
  #   which is private to the response's author and their teachers.
  # @param viewer [User, nil] the signed-in user the summary is for. Decides
  #   which reaction chips show as already reacted; nil marks none as reacted.
  def summarize(assets_for_upload: false, include_evaluation: false, include_feedback: true, viewer: nil)
    lesson = challenge.lesson
    summary = {
      id: id,
      challenge_id: challenge_id,
      user_id: user_id,
      user_name: user.name,
      unit_id: lesson&.script_id,
      lesson_position: lesson&.relative_position,
      student_text: student_text,
      transcript: transcript,
      evaluation_status: evaluation_status,
      is_final: is_final,
      created_at: created_at,
      assets: challenge_response_assets.map {|asset| asset.summarize(upload: assets_for_upload)},
      reactions: reaction_summary(viewer),
    }
    summary[:student_feedback] = student_feedback if include_feedback
    if include_evaluation
      summary[:evaluation_result] = evaluation_result
      summary[:evaluated_at] = evaluated_at
    end
    summary
  end

  # Emoji reaction tallies for the gallery chips: one entry per emoji that
  # has at least one reaction, each {emoji, count, reacted}, where `reacted`
  # is whether `viewer` is among the reactors. Ordered by the fixed emoji
  # vocabulary so chips keep a stable left-to-right order across responses.
  # Reads the loaded association (group in Ruby, not SQL) so a preloaded
  # gallery listing does not fan out into a query per response.
  def reaction_summary(viewer)
    by_emoji = challenge_response_reactions.group_by(&:emoji)
    ChallengeResponseReaction::EMOJIS.filter_map do |emoji|
      reactions = by_emoji[emoji]
      next unless reactions
      {
        emoji: emoji,
        count: reactions.size,
        reacted: viewer.present? && reactions.any? {|reaction| reaction.user_id == viewer.id},
      }
    end
  end
end
