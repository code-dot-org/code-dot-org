# The emoji reaction vocabulary of the Tutor+ galleries, shared by challenge
# response and class gallery project reactions, and the tally shape their
# chips render.
module EmojiReactions
  # Stored by name (the gallery maps each to a glyph), in the order chips
  # render. A fixed set keeps the column a short, index-friendly token.
  EMOJIS = %w[clap fire smile heart party trophy].freeze

  # One {emoji, count, reacted} per emoji with at least one reaction, in
  # EMOJIS order so chips keep a stable left-to-right order; `reacted` is
  # whether `viewer` is among the reactors. Groups in Ruby, not SQL, so a
  # preloaded listing does not fan out into a query per row.
  def self.summarize(reactions, viewer)
    by_emoji = reactions.group_by(&:emoji)
    EMOJIS.filter_map do |emoji|
      matching = by_emoji[emoji]
      next unless matching
      {
        emoji: emoji,
        count: matching.size,
        reacted: viewer.present? && matching.any? {|reaction| reaction.user_id == viewer.id},
      }
    end
  end
end
