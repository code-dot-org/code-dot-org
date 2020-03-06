require 'minitest/autorun'
require_relative 'test_helper'
require 'cdo/aws/rds'

class TestRDS < Minitest::Test
  def setup
    @source_cluster_id = 'source-cluster'
    @clone_cluster_id = 'cluster-clone'

    @source_cluster = {
      "db_clusters": [
        {
          "allocated_storage": 1,
          "availability_zones": [
            "us-east-1e",
            "us-east-1c",
            "us-east-1d"
          ],
          "backup_retention_period": 30,
          "database_name": "anyonecanlearn",
          "db_cluster_identifier": @source_cluster_id,
          "db_cluster_parameter_group": "#{@source_cluster}-auroraclusterdbparameters-1a2b3c4d5e",
          "db_subnet_group": "vpc-dbsubnetgroup-9z8y7x6w",
          "status": "available",
          "earliest_restorable_time": "2020-01-01T00:00:00.000Z",
          "endpoint": "#{@source_cluster}.cluster-abcdefghijk.us-east-1.rds.amazonaws.com",
          "reader_endpoint": "#{@source_cluster}.cluster-ro-abcdefghijk.us-east-1.rds.amazonaws.com",
          "multi_az": true,
          "engine": "aurora-mysql",
          "engine_version": "5.7.mysql_aurora.2.04.8",
          "latest_restorable_time": "2020-01-31T23:59:59.999Z",
          "port": 3306,
          "master_username": "admin",
          "preferred_backup_window": "00:00-00:30",
          "preferred_maintenance_window": "sun:08:00-sun:08:30",
          "read_replica_identifiers": [],
          "db_cluster_members": [
            {
              "db_instance_identifier": "#{@source_cluster}-1",
              "is_cluster_writer": false,
              "db_cluster_parameter_group_status": "in-sync",
              "promotion_tier": 1
            },
            {
              "db_instance_identifier": "#{@source_cluster}-0",
              "is_cluster_writer": true,
              "db_cluster_parameter_group_status": "in-sync",
              "promotion_tier": 1
            }
          ],
          "vpc_security_groups": [
            {
              "vpc_security_group_id": "sg-123456789a",
              "status": "active"
            }
          ],
          "hosted_zone_id": "ZYXWVU",
          "storage_encrypted": true,
          "kms_key_id": "arn:aws:kms:us-east-1:0987654321:key/1a2b-3c4d-5f6g",
          "db_cluster_resource_id": "cluster-Z9Y8X7",
          "db_cluster_arn": "arn:aws:rds:us-east-1:0987654321:cluster:#{@source_cluster}",
          "associated_roles": [],
          "iam_database_authentication_enabled": true,
          "clone_group_id": "1a2b-3c4d-5f6g",
          "cluster_create_time": "2019-12-31T23:59:59.999Z",
          "enabled_cloudwatch_logs_exports": [
            "audit",
            "error",
            "general",
            "slowquery"
          ],
          "engine_mode": "provisioned",
          "deletion_protection": true,
          "http_endpoint_enabled": false,
          "copy_tags_to_snapshot": false
        }
      ]
    }

    @clone_cluster_response = {
      "db_cluster": @source_cluster['db_clusters'][0].deep_merge(
        {
          "db_cluster_identifier": @clone_cluster_id,
          "status": "creating",
          "endpoint": "#{@clone_cluster_id}.cluster-abcdefghijk.us-east-1.rds.amazonaws.com",
          "reader_endpoint": "#{@clone_cluster_id}.cluster-abcdefghijk.us-east-1.rds.amazonaws.com",
          "db_cluster_resource_id": "cluster-A1B2C3D4E5",
          "db_cluster_arn": "arn:aws:rds:us-east-1:0987654321:cluster:#{@clone_cluster_id}",
          "clone_group_id": "9z8y7x6w5v",
          "cluster_create_time": "2020-02-01T00:00:00.000Z",
        }
      )
    }



  end

  def test_clone_cluster
    # clone cluster
    #   - describe cluster (to get attributes to copy to clone)
    #   - restore cluster
    #   - describe db instance (to get attributes of source cluster)
    #   - create db instance
    #   - describe db instance (new cloned instance, by waiter)

  end

  def delete_cluster

  end

end