class CreateScrapbookEntries < ActiveRecord::Migration[7.0]
  def change
    create_table :scrapbook_entries do |t|
      t.references :user, null: false, foreign_key: true, type: :integer
      # An entry is keyed either by (script_id, level_id) for in-curriculum
      # levels, or by channel_id for standalone projects. Both keyings are
      # nullable; the model enforces that exactly one is present.
      t.integer :script_id
      t.integer :level_id
      t.string :channel_id
      t.text :before_asset_url, size: :medium
      t.text :after_asset_url, size: :medium
      t.text :entry_text
      t.timestamps
    end
    # MySQL treats NULL as distinct, so each unique index only constrains rows
    # whose key columns are non-NULL — the script_level rows ignore the channel
    # index and vice versa.
    add_index :scrapbook_entries, [:user_id, :script_id, :level_id], unique: true
    add_index :scrapbook_entries, [:user_id, :channel_id], unique: true
  end
end
