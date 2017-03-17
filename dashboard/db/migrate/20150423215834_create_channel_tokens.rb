class CreateChannelTokens < ActiveRecord::Migration[4.2]
  def up
    create_table :channel_tokens do |t|
      t.string :channel, null: false
      t.references :user, null: false
      t.references :level, null: false
      t.index [:user_id, :level_id], unique: true

      t.timestamps
    end

    big_game_template = Level.find_by_key('Big Game Template').id

    # Copy 'Big Game Template' channel for each user that has one saved.
    PEGASUS_DB[:storage_apps].where('state != "deleted"').each do |row|
      begin
        data = JSON.parse row[:value]
      rescue JSON::ParserError
        puts "Couldn't parse channel with ID '#{row[:id]}'"
        next
      end
      next unless data['projectTemplateLevelName'] == 'Big Game Template'
      channel = storage_encrypt_channel_id(row[:storage_id], row[:id])
      user = user_storage_ids_table.where(id: row[:storage_id]).first
      next unless user && user[:user_id]
      begin
        ChannelToken.create!(channel: channel, user_id: user[:user_id], level_id: big_game_template)
      rescue => e
        puts "Failed to import channel '#{channel}' with ID '#{row[:id]}' and user '#{user[:user_id]}'"
        puts e.backtrace.join("\n")
      end
    end
  end

  def down
    drop_table :channel_tokens
  end
end
