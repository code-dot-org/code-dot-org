class CreateProjectReactions < ActiveRecord::Migration[7.0]
  def change
    create_table :project_reactions do |t|
      # projects.id, as in code_reviews.project_id; projects.id is a 32-bit
      # integer.
      t.integer :project_id, null: false
      t.integer :user_id, null: false
      # A name from EmojiReactions::EMOJIS, not a glyph.
      t.string :emoji, null: false

      t.timestamps
    end

    add_index :project_reactions, :project_id
    add_index :project_reactions, :user_id
    # A user may leave several different emoji on a project but not the same
    # emoji twice. Also backs the toggle-off delete.
    add_index :project_reactions,
      [:project_id, :user_id, :emoji],
      unique: true,
      name: 'index_project_reactions_on_project_user_emoji'
  end
end
