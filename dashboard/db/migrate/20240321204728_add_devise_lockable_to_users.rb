# frozen_string_literal: true

class AddDeviseLockableToUsers < ActiveRecord::Migration[6.1]
  def self.up
    change_table :users do |t|
      t.string :unlock_token

      # Note that we do not add `failed_attempts` or `locked_at` here.
      # Because neither field is used for querying, neither needs to be an
      # actual column and so we implement both in the properties blob.
    end
  end

  def self.down
    change_table :users do |t|
      t.remove :unlock_token
    end
  end
end
