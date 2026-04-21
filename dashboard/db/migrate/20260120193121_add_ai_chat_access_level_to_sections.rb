class AddAiChatAccessLevelToSections < ActiveRecord::Migration[6.1]
  DEFAULT_ACCESS_LEVEL = SharedConstants::AI_CHAT_ACCESS_LEVELS[:DISABLED].freeze

  def up
    add_column :sections, :ai_chat_access_level, :string, default: DEFAULT_ACCESS_LEVEL
  end

  def down
    remove_column :sections, :ai_chat_access_level
  end
end
