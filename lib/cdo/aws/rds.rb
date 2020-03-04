require_relative '../../../deployment'
require 'aws-sdk-rds'

module Cdo
  class RDS

    # Create an RDS Aurora MySQL cluster cloned from a specified source cluster.
    # @param source_cluster_id [String] DB cluster id of the cluster to clone.  Defaults to current environment's cluster.
    # @param clone_cluster_id [String] DB cluster id to assign to clone.  Defaults to source cluster id + "-clone"
    # @param instance_type [String]
    # Returns [String] ARN of new cluster, if provisioned successfully.
    def self.clone_cluster(source_cluster_id: CDO.db_cluster_id, clone_cluster_id: "#{source_cluster_id}-clone", instance_type: nil)
      puts clone_cluster_id
      rds_client = Aws::RDS::Client.new
        begin
          CDO.log.info "Creating clone of database cluster - #{source_cluster_id}"
          existing_cluster = rds_client.describe_db_clusters({db_cluster_identifier: source_cluster_id}).db_clusters.first
          rds_client.restore_db_cluster_to_point_in_time(
            {
              db_cluster_identifier: clone_cluster_id,
              restore_type: 'copy-on-write',
              source_db_cluster_identifier: source_cluster_id,
              use_latest_restorable_time: true,
              db_subnet_group_name: existing_cluster.db_subnet_group,
              vpc_security_group_ids: existing_cluster.vpc_security_groups.map(&:vpc_security_group_id),
              tags: [
                {
                  key: 'environment',
                  value: CDO.rack_env.to_s,
                },
              ]
            }
          )
          rds_client.create_db_instance(
            {
              db_instance_identifier: DATABASE_CLUSTER_CLONE_INSTANCE_ID,
              db_instance_class: instance_type,
              engine: existing_cluster.engine,
              db_cluster_identifier: clone_cluster_id,
            }
          )
          # Wait 30 minutes.  As of mid-2019, it takes about 15 minutes to provision a clone of the production cluster.
          rds_client.wait_until(:db_instance_available, {db_instance_identifier: DATABASE_CLUSTER_CLONE_INSTANCE_ID}, {max_attempts: 30, delay: 60})
        rescue Aws::Waiters::Errors::WaiterFailed => error
          CDO.log.info "Error waiting for cluster clone instance to become available. #{error.message}"
        end
        CDO.log.info "Done creating clone of database cluster."
      return 'new cluster arn'
    end

    def self.delete_cluster(cluster_arn)

    end
  end
end
