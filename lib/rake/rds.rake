require 'cdo/aws/rds'
require lib_dir 'cdo/data/logging/rake_task_event_logger'
include TimedTaskWithLogging

namespace :rds do
  # Provide all 3 arguments:
  #   bundle exec rake rds:clone_cluster SOURCE_CLUSTER_ID=my-favorite-cluster CLONE_CLUSTER_ID=my-second-fav INSTANCE_ID=db.r7i.large
  # Use default 'db.r7i.xlarge' instance type, which is likely the smallest that can operate on a clone of the
  # production cluster, which is the most common usage of this task:
  #   bundle exec rake rds:clone_cluster SOURCE_CLUSTER_ID=my-favorite-cluster CLONE_CLUSTER_ID=my-second-fav
  # Use default clone id (suffix source cluster id with '-clone'):
  #   bundle exec rake rds:clone_cluster SOURCE_CLUSTER_ID=my-favorite-cluster
  desc 'Clone SOURCE_CLUSTER_ID to optional CLONE_CLUSTER_ID with optional INSTANCE_TYPE.'
  timed_task_with_logging :clone_cluster do
    options = {
      source_cluster_id: ENV.fetch('SOURCE_CLUSTER_ID'),
      clone_cluster_id: ENV.fetch('CLONE_CLUSTER_ID', nil),
      instance_type: ENV.fetch('INSTANCE_TYPE', nil)
    }
    Cdo::RDS.clone_cluster(**options.compact)
  end

  desc 'Delete CLUSTER_ID'
  timed_task_with_logging :delete_cluster do
    raise StandardError.new("CLUSTER_ID environment variable is required.") unless ENV['CLUSTER_ID'].present?
    Cdo::RDS.delete_cluster(ENV.fetch('CLUSTER_ID'))
  end
end
