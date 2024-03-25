# frozen_string_literal: true

class AddDeviseLockableToUsers < ActiveRecord::Migration[6.1]
  def self.up
    change_table :users do |t|
      ## Lockable
      t.integer :failed_attempts, default: 0, null: false # Only if lock strategy is :failed_attempts
      t.string :unlock_token # Only if unlock strategy is :email or :both
      t.datetime :locked_at
    end
  end

  def self.down
    change_table :users do |t|
      ## Lockable
      t.remove :failed_attempts
      t.remove :unlock_token
      t.remove :locked_at
    end
  end
end
