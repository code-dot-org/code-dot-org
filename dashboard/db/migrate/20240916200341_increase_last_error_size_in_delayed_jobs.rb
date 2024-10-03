class IncreaseLastErrorSizeInDelayedJobs < ActiveRecord::Migration[6.1]
  def up
    change_column :delayed_jobs, :last_error, :text, limit: 16.megabytes - 1 # for MEDIUMTEXT
  end

  def down
    change_column :delayed_jobs, :last_error, :text # to revert back to TEXT
  end
end
