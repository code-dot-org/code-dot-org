class CreateUserScripts < ActiveRecord::Migration
  def change
    create_table :user_scripts do |t|
      t.integer :user_id, null: false
      t.integer :script_id, null: false
      t.datetime :started_at
      t.datetime :completed_at
      t.datetime :assigned_at
      t.datetime :last_progress_at

      t.timestamps

      t.index [:user_id, :script_id], unique: true
    end
  end
end
