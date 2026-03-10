# frozen_string_literal: true

# This migration comes from demo_mode (originally 20201111000000)
class AddDemoModeSessionsVariant < ActiveRecord::Migration[5.1]
  def change
    add_column :demo_mode_sessions, :variant, :string, null: false, default: 'default'
  end
end
