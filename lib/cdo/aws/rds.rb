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
      return 'new cluster arn'
    end

    def self.delete_cluster(cluster_arn)

    end
  end
end
