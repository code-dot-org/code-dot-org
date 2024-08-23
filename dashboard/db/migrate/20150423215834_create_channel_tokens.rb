class CreateChannelTokens < ActiveRecord::Migration[4.2]
  def up
    create_table :channel_tokens do |t|
      t.string :channel, null: false
      t.references :user, null: false
      t.references :level, null: false
      t.index [:user_id, :level_id], unique: true

      t.timestamps
    end
  end

  def down
    drop_table :channel_tokens
  end
end
