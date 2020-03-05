require_relative '../../../deployment'
require 'aws-sdk-rds'

module Cdo
  class RDS
    # Create an RDS Aurora MySQL cluster cloned from a specified source cluster.
    # @param source_cluster_id [String] DB cluster id of the cluster to clone.  Defaults to current environment's cluster.
    # @param clone_cluster_id [String] DB cluster id to assign to clone.  Defaults to source cluster id + "-clone"
    # @param instance_type [String]
    # Returns [String] ARN of new cluster, if provisioned successfully.
    def self.clone_cluster(
      source_cluster_id: CDO.db_cluster_id,
      clone_cluster_id: "#{source_cluster_id}-clone",
      instance_type: 'db.r4.large'
    )
      clone_instance_id = clone_cluster_id + "-0"
      rds_client = Aws::RDS::Client.new
      begin
        CDO.log.info "Creating clone of database cluster - #{source_cluster_id}"
        source_cluster = rds_client.describe_db_clusters({db_cluster_identifier: source_cluster_id}).db_clusters.first
        rds_client.restore_db_cluster_to_point_in_time(
          {
            db_cluster_identifier: clone_cluster_id,
            restore_type: 'copy-on-write',
            source_db_cluster_identifier: source_cluster_id,
            use_latest_restorable_time: true,
            db_subnet_group_name: source_cluster.db_subnet_group,
            vpc_security_group_ids: source_cluster.vpc_security_groups.map(&:vpc_security_group_id),
          }
        )
        source_writer_instance_identifier = source_cluster.
          db_cluster_members.
          select(&:is_cluster_writer).
          first.
          db_instance_identifier
        source_writer_instance = rds_client.
          describe_db_instances({db_instance_identifier: source_writer_instance_identifier}).
          db_instances.
          first
        rds_client.create_db_instance(
          {
            db_instance_identifier: clone_instance_id,
            db_instance_class: instance_type,
            engine: source_cluster.engine,
            db_cluster_identifier: clone_cluster_id,
            db_parameter_group_name: source_writer_instance.db_parameter_groups[0].db_parameter_group_name
          }
        )
        # Wait 30 minutes.  As of mid-2019, it takes about 15 minutes to provision a clone of the production cluster.
        rds_client.wait_until(
          :db_instance_available,
          {db_instance_identifier: clone_instance_id},
          {max_attempts: 30, delay: 60}
        )
      rescue Aws::Waiters::Errors::WaiterFailed => error
        CDO.log.info "Error waiting for cluster clone instance to become available. #{error.message}"
      end
      CDO.log.info "Done creating clone of database cluster."
    end

    def self.delete_cluster(cluster_id)
      rds_client = Aws::RDS::Client.new
      begin
        existing_cluster = rds_client.describe_db_clusters({db_cluster_identifier: cluster_id}).db_clusters.first
        existing_cluster.db_cluster_members.each do |instance|
          rds_client.delete_db_instance(
            {
              db_instance_identifier: instance.db_instance_identifier,
              skip_final_snapshot: true,
            }
          )
          rds_client.wait_until(
            :db_instance_deleted,
            {db_instance_identifier: instance.db_instance_identifier},
            {max_attempts: 20, delay: 60}
          )
          rds_client.delete_db_cluster(
            {
              db_cluster_identifier: cluster_id,
              skip_final_snapshot: true,
            }
          )
        end
      rescue Aws::RDS::Errors::DBClusterNotFoundFault => error
        CDO.log.info "Cluster #{cluster_id} does not exist. #{error.message}.  No need to delete it."
      end
    end
  end
end
