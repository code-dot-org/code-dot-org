class AddFailedAtPriorityRunAtIndexToDelayedJobs < ActiveRecord::Migration[7.1]
  def change
    add_index :delayed_jobs, [:failed_at, :priority, :run_at], algorithm: :inplace
    remove_index :delayed_jobs, [:priority, :run_at], name: 'delayed_jobs_priority', algorithm: :inplace
  end
end
