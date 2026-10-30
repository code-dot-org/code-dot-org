# This migration creates the `failed_delayed_jobs` table, which is intended to be an
# identical copy of the `delayed_jobs` table. It serves as an archive for failed
# jobs to keep the primary `delayed_jobs` table small and performant.
class CreateFailedDelayedJobs < ActiveRecord::Migration[6.1]
  def change
    create_table :failed_delayed_jobs do |table|
      table.integer :priority, default: 0, null: false
      table.integer :attempts, default: 0, null: false
      table.text :handler,                 null: false
      table.text :last_error, limit: 16.megabytes - 1
      table.datetime :run_at
      table.datetime :locked_at
      table.datetime :failed_at
      table.string :locked_by
      table.string :queue
      table.timestamps null: true
    end

    add_index :failed_delayed_jobs, :failed_at
  end
end
