require_relative '../../../deployment'
require 'aws-sdk-rds'
require 'set'

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
      # We currently standardize on the `r7i` family. The `xlarge` instance type is likely the smallest that can operate on
      # a clone of the production cluster, which is the most common usage of this method.
      instance_type: 'db.r7i.xlarge',
      max_attempts: 30,  # It takes ~15 minutes to clone the production cluster, so default to 30 minutes.
      delay: 60
    )
      clone_instance_id = clone_cluster_id + "-0"
      rds_client = ::Aws::RDS::Client.new
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

        copy_source_writer_instance_parameter_group_name = copy_parameter_group_unless_default(
          source_writer_instance[:db_parameter_groups][0][:db_parameter_group_name],
          clone_instance_parameter_group
        )

        rds_client.create_db_instance(
          db_instance_identifier: clone_instance_id,
          db_instance_class: instance_type,
          engine: source_cluster.engine,
          db_cluster_identifier: clone_cluster_id,
          db_parameter_group_name: copy_source_writer_instance_parameter_group_name
        )
        # The RDS SDK doesn't provide a waiter for cluster operations.  Once the db instance is provisioned, the
        # cluster is ready.
        rds_client.wait_until(
          :db_instance_available,
          {db_instance_identifier: clone_instance_id},
          {max_attempts: max_attempts, delay: delay}
        )
      rescue ::Aws::Waiters::Errors::WaiterFailed => exception
        CDO.log.info "Error waiting for cluster clone instance to become available. #{exception}"
      end
      CDO.log.info "Done creating database cluster - #{clone_cluster_id}"
    end

    def self.delete_cluster(cluster_id, max_attempts = 20, delay = 60)
      raise StandardError.new("cluster_id is required") unless cluster_id.present?
      rds_client = ::Aws::RDS::Client.new
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
      rescue ::Aws::RDS::Errors::DBClusterNotFoundFault => exception
        CDO.log.info "Cluster #{cluster_id} does not exist. #{exception}.  No need to delete it."
      end
    end

    # The AWS SDK does not currently provide waiters for DBCluster operations.
    def self.wait_until_db_cluster_deleted(db_cluster_id, max_attempts, delay)
      rds_client = ::Aws::RDS::Client.new
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
        rescue ::Aws::RDS::Errors::DBClusterNotFoundFault => exception
          cluster_state = 'deleted'
          CDO.log.info "Database Cluster #{db_cluster_id} has been deleted. #{exception}"
        end
        attempts += 1
        sleep delay
      end

      unless cluster_state == 'deleted'
        raise StandardError.new("Timeout after waiting #{max_attempts * delay} seconds for cluster " \
        "#{db_cluster_id} deletion to complete.  Current cluster status - #{cluster_state}"
        )
      end
    end

    # Zero ETL integration data-filter management. These wrap the RDS API for reading/modifying an
    # integration's Maxwell table filter; the *desired* filter for a database is computed elsewhere
    # from the schema (see `AnalyticsExportable.zero_etl_data_filter`) and passed in here.

    # Reads the integration's current data_filter (RDS `describe_integrations`), reconciles the rules
    # for `db_name` against `desired_data_filter`, and — unless `dry_run` — writes the reconciled
    # filter back (RDS `modify_integration`). Rules for other databases are left untouched.
    #
    # @param integration_arn [String] ARN of the Zero ETL integration.
    # @param desired_data_filter [String] the full desired data_filter for `db_name` (Maxwell syntax).
    # @param db_name [String] the database whose rules this reconciles, e.g. "dashboard_production".
    # @param dry_run [Boolean] when true, computes the diff without applying it.
    # @param rds_client [Aws::RDS::Client] injectable for testing.
    # @return [Hash] reconciliation result from `reconcile_zero_etl_filters`.
    def self.update_zero_etl_integration!(integration_arn:, desired_data_filter:, db_name:, dry_run: false, rds_client: nil)
      rds_client ||= ::Aws::RDS::Client.new

      resp = rds_client.describe_integrations(integration_identifier: integration_arn)
      integration = resp.integrations.first
      raise ArgumentError, "Integration not found: #{integration_arn}" unless integration

      result = reconcile_zero_etl_filters(integration.data_filter, desired_data_filter, db_name: db_name)

      unless dry_run || (result[:to_add].empty? && result[:to_remove].empty?)
        rds_client.modify_integration(
          integration_identifier: integration_arn,
          data_filter: result[:reconciled_filter]
        )
      end

      result
    end

    # Computes the diff between an integration's current data_filter and the desired filter for one
    # database. Only rules referencing `db_name` are reconciled; rules for other databases (e.g. a
    # hand-maintained `include: pegasus_test.*`) are preserved in place, untouched.
    #
    # @param current_data_filter [String] the integration's current data_filter.
    # @param desired_data_filter [String] the desired data_filter for `db_name`.
    # @param db_name [String]
    # @return [Hash] :to_add, :to_remove, :unchanged (all sorted), :reconciled_filter
    def self.reconcile_zero_etl_filters(current_data_filter, desired_data_filter, db_name:)
      current_rules = parse_data_filter(current_data_filter)
      desired_db_rules = parse_data_filter(desired_data_filter).select {|rule| rule_for_database?(rule, db_name)}

      other_rules = current_rules.reject {|rule| rule_for_database?(rule, db_name)}
      current_db_rules = current_rules.select {|rule| rule_for_database?(rule, db_name)}

      current_set = Set.new(current_db_rules)
      desired_set = Set.new(desired_db_rules)

      # Preserve the desired filter's rule order for this database: Maxwell filter precedence is
      # order-sensitive, so a broad `include: db.*` must stay ahead of the `exclude:`s that narrow it.
      reconciled = other_rules + desired_db_rules

      {
        to_add: (desired_set - current_set).sort,
        to_remove: (current_set - desired_set).sort,
        unchanged: (current_set & desired_set).sort,
        reconciled_filter: reconciled.join(", ")
      }
    end

    # Splits a Maxwell data_filter string into individual rule strings.
    def self.parse_data_filter(data_filter)
      return [] if data_filter.nil? || data_filter.strip.empty?
      data_filter.split(/,\s*/)
    end

    # Returns true if a Maxwell filter rule references the given database.
    def self.rule_for_database?(rule, db_name)
      rule.match?(/\b#{Regexp.escape(db_name)}\./)
    end

    # You can't copy a default parameter group, so we provide a helper method
    # which if the specified parameter group is a default will return the name
    # of that same default to be reused, and will otherwise create a copy and
    # return the name of that copy.
    #
    # See https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_WorkingWithDBClusterParamGroups.html#USER_WorkingWithParamGroups.CopyingCluster
    private_class_method def self.copy_parameter_group_unless_default(source_name, target_name, target_description = nil)
      # It really seems like there should be a more reliable way to determine
      # whether a given parameter group is default or custom than inspecting
      # the name, but I haven't been able to find one.
      return source_name if source_name.start_with?('default.')

      rds_client = ::Aws::RDS::Client.new
      copied_parameter_group = rds_client.copy_db_parameter_group(
        source_db_parameter_group_identifier: source_name,
        target_db_parameter_group_identifier: target_name,
        # reuse identifier for description if none specified
        target_db_parameter_group_description: target_description || target_name,
      ).db_parameter_group
      return copied_parameter_group.db_parameter_group_name
    end
  end
end
