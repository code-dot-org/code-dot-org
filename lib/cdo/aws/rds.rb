require_relative '../../../deployment'
require 'aws-sdk-rds'

module Cdo
  class RDS
    # Create an RDS Aurora MySQL cluster cloned from a specified source cluster.  Make and use copies of the source
    # Parameter Groups to avoid inadvertent configuration changes to the source cluster.  Unfortunately, it isn't
    # possible to use a CloudFormation template to provision the cluster due to an issue where CloudFormation ignores
    # the DBClusterParameterGroup property:
    # @param source_cluster_id [String] DB cluster id of the cluster to clone.  Defaults to current environment's cluster.
    # @param clone_cluster_id [String] DB cluster id to assign to clone.  Defaults to source cluster id + "-clone"
    # @param instance_type [String] RDS DB Instance Type
    # @param max_attempts [Integer] Number of times to check whether task has completed successfully before failing.
    # @param delay [Integer] Number of seconds to wait between checking task status.
    def self.clone_cluster(
      source_cluster_id: CDO.db_cluster_id,
      clone_cluster_id: "#{source_cluster_id}-clone",
      instance_type: 'db.r4.large',
      max_attempts: 30,  # It takes ~15 minutes to clone the production cluster, so default to 30 minutes.
      delay: 60
    )
      clone_instance_id = clone_cluster_id + "-0"
      rds_client = Aws::RDS::Client.new
      begin
        CDO.log.info "Creating clone of database cluster - #{source_cluster_id}"
        source_cluster = rds_client.describe_db_clusters({db_cluster_identifier: source_cluster_id}).db_clusters.first
        clone_cluster_parameter_group = "#{clone_cluster_id}-auroraclusterdbparameters"
        clone_instance_parameter_group = "#{clone_cluster_id}-aurorawriterdbparameters"

        copy_source_cluster_parameter_group = rds_client.copy_db_cluster_parameter_group(
          source_db_cluster_parameter_group_identifier: source_cluster[:db_cluster_parameter_group],
          target_db_cluster_parameter_group_description: clone_cluster_parameter_group,
          target_db_cluster_parameter_group_identifier: clone_cluster_parameter_group
        ).db_cluster_parameter_group

        rds_client.restore_db_cluster_to_point_in_time(
          db_cluster_identifier: clone_cluster_id,
          restore_type: 'copy-on-write',
          source_db_cluster_identifier: source_cluster_id,
          use_latest_restorable_time: true,
          db_subnet_group_name: source_cluster.db_subnet_group,
          vpc_security_group_ids: source_cluster.vpc_security_groups.map(&:vpc_security_group_id),
          db_cluster_parameter_group_name: copy_source_cluster_parameter_group.db_cluster_parameter_group_name
        )
        source_writer_instance_identifier = source_cluster.
          db_cluster_members.
          find(&:is_cluster_writer).
          db_instance_identifier
        source_writer_instance = rds_client.
          describe_db_instances({db_instance_identifier: source_writer_instance_identifier}).
          db_instances.
          first

        copy_source_writer_instance_parameter_group = rds_client.copy_db_parameter_group(
          source_db_parameter_group_identifier: source_writer_instance[:db_parameter_groups][0][:db_parameter_group_name],
          target_db_parameter_group_description: clone_instance_parameter_group,
          target_db_parameter_group_identifier: clone_instance_parameter_group,
        ).db_parameter_group

        rds_client.create_db_instance(
          db_instance_identifier: clone_instance_id,
          db_instance_class: instance_type,
          engine: source_cluster.engine,
          db_cluster_identifier: clone_cluster_id,
          db_parameter_group_name: copy_source_writer_instance_parameter_group.db_parameter_group_name
        )
        # The RDS SDK doesn't provide a waiter for cluster operations.  Once the db instance is provisioned, the
        # cluster is ready.
        rds_client.wait_until(
          :db_instance_available,
          {db_instance_identifier: clone_instance_id},
          {max_attempts: max_attempts, delay: delay}
        )
      rescue Aws::Waiters::Errors::WaiterFailed => error
        CDO.log.info "Error waiting for cluster clone instance to become available. #{error.message}"
      end
      CDO.log.info "Done creating database cluster - #{clone_cluster_id}"
    end

    def self.delete_cluster(cluster_id, max_attempts = 20, delay = 60)
      rds_client = Aws::RDS::Client.new
      begin
        existing_cluster = rds_client.describe_db_clusters({db_cluster_identifier: cluster_id}).db_clusters.first
        existing_cluster.db_cluster_members.each do |instance|
          instance_details = rds_client.describe_db_instances(
            db_instance_identifier: instance.db_instance_identifier,
          ).db_instances.first

          rds_client.delete_db_instance(
            db_instance_identifier: instance.db_instance_identifier,
            skip_final_snapshot: true,
          )
          rds_client.wait_until(
            :db_instance_deleted,
            {db_instance_identifier: instance.db_instance_identifier},
            {max_attempts: max_attempts, delay: delay}
          )

          # Delete Parameter Group if it was created just for this cluster to use.
          next unless instance_details.db_parameter_groups.first.db_parameter_group_name == "#{cluster_id}-aurorawriterdbparameters"
          rds_client.delete_db_parameter_group(
            db_parameter_group_name: instance_details.db_parameter_groups.first.db_parameter_group_name
          )
        end
        rds_client.delete_db_cluster(
          db_cluster_identifier: cluster_id,
          skip_final_snapshot: true,
        )
        wait_until_db_cluster_deleted(cluster_id, max_attempts, delay)

        # Delete Parameter Group if it was created just for this cluster to use.
        if existing_cluster.db_cluster_parameter_group == "#{cluster_id}-auroraclusterdbparameters"
          rds_client.delete_db_cluster_parameter_group(
            db_cluster_parameter_group_name: existing_cluster.db_cluster_parameter_group
          )
        end
      rescue Aws::RDS::Errors::DBClusterNotFoundFault => error
        CDO.log.info "Cluster #{cluster_id} does not exist. #{error.message}.  No need to delete it."
      end
    end

    # The AWS SDK does not currently provide waiters for DBCluster operations.
    def self.wait_until_db_cluster_deleted(db_cluster_id, max_attempts, delay)
      rds_client = Aws::RDS::Client.new
      attempts = 0
      cluster_state = nil
      while attempts <= max_attempts && cluster_state != 'deleted'
        begin
          # describe_db_cluster will Raise a DBClusterNotFound Error when the cluster has been deleted.
          cluster_state = rds_client.
            describe_db_clusters({db_cluster_identifier: db_cluster_id}).
            db_clusters.
            first.
            status
        rescue Aws::RDS::Errors::DBClusterNotFoundFault => error
          cluster_state = 'deleted'
          CDO.log.info "Database Cluster #{db_cluster_id} has been deleted. #{error.message}"
        end
        attempts += 1
        sleep delay
      end

      unless cluster_state == 'deleted'
        raise StandardError.new("Timeout after waiting #{max_attempts * delay} seconds for cluster" \
        " #{db_cluster_id} deletion to complete.  Current cluster status - #{cluster_state}"
        )
      end
    end
  end
end
