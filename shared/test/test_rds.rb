require 'minitest/autorun'
require_relative 'test_helper'
require 'cdo/aws/rds'

class TestRDS < Minitest::Test
  def setup
    @source_cluster_id = 'source-cluster'
    @clone_cluster_id = 'cluster-clone'
    @cluster_to_delete_id = 'delete-me-cluster'

    @source_cluster = {
      "db_clusters": [
        {
          "database_name": "anyonecanlearn",
          "db_cluster_identifier": @source_cluster_id,
          "db_cluster_parameter_group": "#{@source_cluster_id}-auroraclusterdbparameters-1a2b3c4d5e",
          "db_subnet_group": "vpc-dbsubnetgroup-9z8y7x6w",
          "status": "available",
          "earliest_restorable_time": Time.parse('2020-01-01T00:00:00.000Z'),
          "endpoint": "#{@source_cluster_id}.cluster-abcdefghijk.us-east-1.rds.amazonaws.com",
          "reader_endpoint": "#{@source_cluster_id}.cluster-ro-abcdefghijk.us-east-1.rds.amazonaws.com",
          "engine": "aurora-mysql",
          "engine_version": "5.7.mysql_aurora.2.04.8",
          "latest_restorable_time": Time.parse('2020-01-31T23:59:59.999Z'),
          "port": 3306,
          "master_username": "admin",
          "db_cluster_members": [
            {
              "db_instance_identifier": "#{@source_cluster_id}-1",
              "is_cluster_writer": false,
              "db_cluster_parameter_group_status": "in-sync",
              "promotion_tier": 1
            },
            {
              "db_instance_identifier": "#{@source_cluster_id}-0",
              "is_cluster_writer": true,
              "db_cluster_parameter_group_status": "in-sync",
              "promotion_tier": 1
            }
          ],
          "hosted_zone_id": "ZYXWVU",
          "db_cluster_resource_id": "cluster-Z9Y8X7",
          "db_cluster_arn": "arn:aws:rds:us-east-1:0987654321:cluster:#{@source_cluster_id}",
          "clone_group_id": "1a2b-3c4d-5f6g",
          "cluster_create_time": Time.parse('2019-12-31T23:59:59.999Z')
        }
      ]
    }

    @copy_cluster_parameter_group_response = {
      "db_cluster_parameter_group":
        {
          "db_cluster_parameter_group_name": "#{@clone_cluster_id}-auroraclusterdbparameters",
          "db_parameter_group_family": "aurora-mysql5.7",
          "description": "#{@clone_cluster_id}-auroraclusterdbparameters",
          "db_cluster_parameter_group_arn": "arn:aws:rds:us-east-1:0987654321:cluster-pg:#{@clone_cluster_id}-auroraclusterdbparameters"
        }
    }

    @clone_cluster_response = {
      "db_cluster": @source_cluster[:db_clusters][0].deep_merge(
        {
          "db_cluster_identifier": @clone_cluster_id,
          "status": "creating",
          "endpoint": "#{@clone_cluster_id}.cluster-abcdefghijk.us-east-1.rds.amazonaws.com",
          "reader_endpoint": "#{@clone_cluster_id}.cluster-abcdefghijk.us-east-1.rds.amazonaws.com",
          "db_cluster_resource_id": "cluster-A1B2C3D4E5",
          "db_cluster_arn": "arn:aws:rds:us-east-1:0987654321:cluster:#{@clone_cluster_id}",
          "clone_group_id": "9z8y7x6w5v",
          "cluster_create_time": Time.parse('2020-02-01T00:00:00.000Z'),
        }
      )
    }

    @source_instance = {
      "db_instances": [
        {
          "db_instance_identifier": "#{@source_cluster_id}-0",
          "db_instance_class": "db.r4.large",
          "engine": "aurora-mysql",
          "db_instance_status": "available",
          "master_username": "admin",
          "db_name": "anyonecanlearn",
          "instance_create_time": Time.now,
          "db_parameter_groups": [
            {
              "db_parameter_group_name": "#{@source_cluster_id}-writerdbparameters-a1b2c3de",
              "parameter_apply_status": "in-sync"
            }
          ],
          "storage_type": "aurora",
          "db_cluster_identifier": @source_cluster_id,
          "dbi_resource_id": "db-Z9Y8X7",
          "promotion_tier": 1,
          "db_instance_arn": "arn:aws:rds:us-east-1:abcdefghijk:db:production-aurora-us-east-1d",
          "deletion_protection": false,
        }
      ]
    }

    @copy_instance_parameter_group_response = {
      "db_parameter_group": {
        "db_parameter_group_name": "#{@clone_cluster_id}-aurorawriterdbparameters",
        "db_parameter_group_family": "aurora-mysql5.7",
        "description": "#{@clone_cluster_id}-aurorawriterdbparameters",
        "db_parameter_group_arn": "arn:aws:rds:us-east-1:0987654321:pg:#{@clone_cluster_id}-aurorawriterdbparameters"
      }
    }

    @create_instance_response = {
      "db_instance": @source_instance[:db_instances][0].deep_merge(
        {
          "db_instance_identifier": "#{@clone_cluster_id}-0",
          "db_instance_status": "creating",
          "db_cluster_identifier": @clone_cluster_id,
          "dbi_resource_id": "db-A1B2C3D4E5",
          "db_instance_arn": "arn:aws:rds:us-east-1:0987654321:db:#{@clone_cluster_id}-0"
        }
      )
    }

    @create_instance_complete = {
      "db_instances": [
        @create_instance_response[:db_instance].deep_merge(
          {
            "db_instance_status": "available"
          }
        )
      ]
    }

    @cluster_to_delete = @source_cluster.deep_merge(
      {
        "db_clusters": [
          {
            "db_cluster_identifier": @cluster_to_delete_id,
            "endpoint": "#{@cluster_to_delete_id}.cluster-abcdefghijk.us-east-1.rds.amazonaws.com",
            "reader_endpoint": "#{@cluster_to_delete_id}.cluster-abcdefghijk.us-east-1.rds.amazonaws.com",
            "db_cluster_resource_id": "cluster-A1B2C3D4E5",
            "db_cluster_arn": "arn:aws:rds:us-east-1:0987654321:cluster:#{@cluster_to_delete_id}",
            "clone_group_id": "9Z8Y7X6W5V",
          }
        ]
      }
    )

    @describe_instance_to_delete_response = {
      "db_instances": [
        @source_instance[:db_instances][0].deep_merge(
          {
            "db_cluster_identifier": "#{@cluster_to_delete_id}-0",
            "dbi_resource_id": "db-Z9Y8X7W6V5",
            "db_instance_arn": "arn:aws:rds:us-east-1:0987654321:db:#{@cluster_to_delete_id}-0",
            "db_parameter_groups": [
              {
                "db_parameter_group_name": "#{@cluster_to_delete_id}-writerdbparameters",
                "parameter_apply_status": "in-sync"
              }
            ]
          }
        )
      ]
    }

    @delete_instance_response = {
      "db_instance": @source_instance[:db_instances][0].deep_merge(
        {
          "db_instance_status": "deleting",
          "db_cluster_identifier": "#{@cluster_to_delete_id}-0",
          "dbi_resource_id": "db-Z9Y8X7W6V5",
          "db_instance_arn": "arn:aws:rds:us-east-1:0987654321:db:#{@cluster_to_delete_id}-0"
        }
      )
    }

    @delete_cluster_response = {
      "db_cluster": @source_cluster[:db_clusters][0].deep_merge(
        "db_cluster_identifier": @cluster_to_delete_id,
        "endpoint": "#{@cluster_to_delete_id}.cluster-abcdefghijk.us-east-1.rds.amazonaws.com",
        "reader_endpoint": "#{@cluster_to_delete_id}.cluster-abcdefghijk.us-east-1.rds.amazonaws.com",
        "db_cluster_resource_id": "cluster-Z1Y2X3W4V5",
        "db_cluster_arn": "arn:aws:rds:us-east-1:0987654321:cluster:#{@cluster_to_delete_id}",
        "clone_group_id": "1z2y3x4w5v",
      )
    }

    @delete_db_parameter_group_response = nil
    @delete_cluster_parameter_group_response = nil
  end

  def test_clone_cluster
    Aws.config[:rds] = {
      stub_responses: {
        describe_db_clusters: @source_cluster,
        copy_db_cluster_parameter_group: @copy_cluster_parameter_group_response,
        restore_db_cluster_to_point_in_time: @clone_cluster_response,
        # The 1st stub returns @source_instance when `clone_cluster` is getting information about the instance to clone.
        # The 2nd stub returns @create_instance_complete when the waiter checks to see if it has been provisioned.
        describe_db_instances: [@source_instance, @create_instance_complete],
        copy_db_parameter_group: @copy_instance_parameter_group_response,
        create_db_instance: @create_instance_response
      }
    }

    Cdo::RDS.clone_cluster(
      source_cluster_id: @source_cluster_id,
      clone_cluster_id: @clone_cluster_id,
      max_attempts: 1,
      delay: 0
    )
  end

  def test_delete_cluster
    Aws.config[:rds] = {
      stub_responses: {
        # The 1st stub of describe_db_clusters returns @source_instance when `clone_cluster` is getting information about the instance to clone.
        # The 2nd stub of describe_db_clusters raises Cluster Not Found error when the waiter checks to see if it has been deleted.
        describe_db_clusters: [@cluster_to_delete, 'DBClusterNotFoundFault'],
        # The 1st stub of describe_db_instances returns information about the instance about to be deleted.
        # The 2nd stub of describe_db_instances raises Instance Not Found error when the watier checks to see if it has been deleted.
        describe_db_instances: [@describe_instance_to_delete_response, 'DBInstanceNotFoundFault'],
        delete_db_instance: @delete_instance_response,
        delete_db_parameter_group: @delete_db_parameter_group_response,
        delete_db_cluster: @delete_cluster_response,
        delete_db_cluster_parameter_group: @delete_cluster_parameter_group_response
      }
    }

    Cdo::RDS.delete_cluster(@cluster_to_delete_id, 1, 0)
  end
end
