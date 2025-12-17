class AddAiChatAccessLevelToSections < ActiveRecord::Migration[6.1]
  class Section < ApplicationRecord
    self.table_name = 'sections'
  end

  DEFAULT_ACCESS_LEVEL = 'disabled'.freeze

  def up
    add_column :sections, :ai_chat_access_level, :string, default: DEFAULT_ACCESS_LEVEL, null: false
  end

  def down
    remove_column :sections, :ai_chat_access_level
  end
end
