require 'cdo/aws/rds'

namespace :rds do
  # EXAMPLE USAGE
  #
  # Providing 3 arguments and defaulting to latest restorable time:
  # bundle exec rake rds:clone_cluster SOURCE_CLUSTER_ID=my-favorite-cluster CLONE_CLUSTER_ID=my-second-fav INSTANCE_ID=db.r4.4xlarge
  #
  # Using default 'db.r4.large' instance type and defaulting to latest restorable time:
  # bundle exec rake rds:clone_cluster SOURCE_CLUSTER_ID=my-favorite-cluster CLONE_CLUSTER_ID=my-second-fav
  #
  # Using default 'db.r4.large' instance type and specifying restore to time:
  # bundle exec rake rds:clone_cluster SOURCE_CLUSTER_ID=my-favorite-cluster CLONE_CLUSTER_ID=my-second-fav RESTORE_TO_TIME="2012-04-20T16:20:00Z"
  #
  # Using default clone id (suffix source cluster id with '-clone'), default instance type, and defaulting to latest restorable time:
  # bundle exec rake rds:clone_cluster SOURCE_CLUSTER_ID=my-favorite-cluster
  desc 'Clone SOURCE_CLUSTER_ID to optional CLONE_CLUSTER_ID with optional INSTANCE_TYPE.'
  task :clone_cluster do
    options = {
      source_cluster_id: ENV['SOURCE_CLUSTER_ID'],
      clone_cluster_id: ENV['CLONE_CLUSTER_ID'],
      instance_type: ENV['INSTANCE_TYPE'],
      restore_to_time: ENV['RESTORE_TO_TIME']
    }
    Cdo::RDS.clone_cluster(options.compact)
  end

  desc 'Delete CLUSTER_ID'
  task :delete_cluster do
    Cdo::RDS.delete_cluster(ENV['CLUSTER_ID'])
  end
end
