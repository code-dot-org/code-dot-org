class CreateChallengeResponseReactions < ActiveRecord::Migration[7.0]
  def change
    create_table :challenge_response_reactions do |t|
      t.references :challenge_response, null: false, foreign_key: true
      t.references :user, null: false, type: :integer, foreign_key: true
      # The reaction emoji, stored by name (e.g. "clap", "heart") from a
      # fixed vocabulary the model enforces, not an arbitrary glyph.
      t.string :emoji, null: false

      t.timestamps
    end

    # One reaction per (response, user, emoji): a user may leave several
    # different emoji on a response but not the same emoji twice. The index
    # also backs the toggle-off delete, which looks up exactly this triple.
    add_index :challenge_response_reactions,
      [:challenge_response_id, :user_id, :emoji],
      unique: true,
      name: 'index_challenge_response_reactions_on_response_user_emoji'
  end
end
