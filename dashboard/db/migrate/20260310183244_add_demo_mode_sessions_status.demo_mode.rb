# frozen_string_literal: true

# This migration comes from demo_mode (originally 20250210222933)
class AddDemoModeSessionsStatus < ActiveRecord::Migration[5.1]
  def change
    add_column :demo_mode_sessions, :status, :string, null: false, default: 'processing'

    reversible do |dir|
      dir.up do
        execute "UPDATE demo_mode_sessions SET status = 'successful'"
      end
    end
  end
end
