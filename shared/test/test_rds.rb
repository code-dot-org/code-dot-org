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
          "allocated_storage": 1,
          "availability_zones": [
            "us-east-1e",
            "us-east-1c",
            "us-east-1d"
          ],
          "backup_retention_period": 30,
          "database_name": "anyonecanlearn",
          "db_cluster_identifier": @source_cluster_id,
          "db_cluster_parameter_group": "#{@source_cluster_id}-auroraclusterdbparameters-1a2b3c4d5e",
          "db_subnet_group": "vpc-dbsubnetgroup-9z8y7x6w",
          "status": "available",
          "earliest_restorable_time": Time.parse('2020-01-01T00:00:00.000Z'),
          "endpoint": "#{@source_cluster_id}.cluster-abcdefghijk.us-east-1.rds.amazonaws.com",
          "reader_endpoint": "#{@source_cluster_id}.cluster-ro-abcdefghijk.us-east-1.rds.amazonaws.com",
          "multi_az": true,
          "engine": "aurora-mysql",
          "engine_version": "5.7.mysql_aurora.2.04.8",
          "latest_restorable_time": Time.parse('2020-01-31T23:59:59.999Z'),
          "port": 3306,
          "master_username": "admin",
          "preferred_backup_window": "00:00-00:30",
          "preferred_maintenance_window": "sun:08:00-sun:08:30",
          "read_replica_identifiers": [],
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
          "db_cluster_arn": "arn:aws:rds:us-east-1:0987654321:cluster:#{@source_cluster_id}",
          "associated_roles": [],
          "iam_database_authentication_enabled": true,
          "clone_group_id": "1a2b-3c4d-5f6g",
          "cluster_create_time": Time.parse('2019-12-31T23:59:59.999Z'),
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
          "endpoint": {
            "address": "#{@source_cluster_id}-0.abcdefghijk.us-east-1.rds.amazonaws.com",
            "port": 3306,
            "hosted_zone_id": @source_cluster[:hosted_zone_id]
          },
          "allocated_storage": 1,
          "instance_create_time": Time.now,
          "preferred_backup_window": "00:17-00:47",
          "backup_retention_period": 30,
          "db_security_groups": [],
          "vpc_security_groups": [
            {
              # TODO: (suresh) This is not getting set correctly..
              "vpc_security_group_id": @source_cluster[:vpc_security_group_id],
              "status": "active"
            }
          ],
          "db_parameter_groups": [
            {
              "db_parameter_group_name": "#{@source_cluster_id}-writerdbparameters-a1b2c3de",
              "parameter_apply_status": "in-sync"
            }
          ],
          "availability_zone": "us-east-1d",
          "db_subnet_group": {
            # TODO: (suresh) This is not getting set correctly..
            "db_subnet_group_name": @source_cluster[:db_subnet_group_name],
            "db_subnet_group_description": @source_cluster[:db_subnet_group_description],
            "vpc_id": @source_cluster[:vpc_id],
            "subnet_group_status": "Complete",
            "subnets": @source_cluster[:subnets]
          },
          "preferred_maintenance_window": "thu:00:05-thu:00:35",
          "pending_modified_values": {},
          "multi_az": false,
          "engine_version": "5.7.mysql_aurora.2.04.8",
          "auto_minor_version_upgrade": true,
          "read_replica_db_instance_identifiers": [],
          "license_model": "general-public-license",
          "option_group_memberships": [
            {
              "option_group_name": "default:aurora-mysql-5-7",
              "status": "in-sync"
            }
          ],
          "publicly_accessible": false,
          "storage_type": "aurora",
          "db_instance_port": 0,
          "db_cluster_identifier": @source_cluster_id,
          "storage_encrypted": true,
          "kms_key_id": "arn:aws:kms:us-east-1:0987654321:key/1a2b-3c4d-5f6g",
          "dbi_resource_id": "db-Z9Y8X7",
          "ca_certificate_identifier": "rds-ca-2020",
          "domain_memberships": [],
          "copy_tags_to_snapshot": false,
          "monitoring_interval": 1,
          "enhanced_monitoring_resource_arn": nil,
          "monitoring_role_arn": "arn:aws:iam::abcdefghijk:role/rds-monitoring-role",
          "promotion_tier": 1,
          "db_instance_arn": "arn:aws:rds:us-east-1:abcdefghijk:db:production-aurora-us-east-1d",
          "iam_database_authentication_enabled": true,
          "performance_insights_enabled": true,
          "performance_insights_kms_key_id": "arn:aws:kms:us-east-1:abcdefghijk:key/1a2b-3c4d-5f6g",
          "performance_insights_retention_period": 731,
          "enabled_cloudwatch_logs_exports": [
            "audit",
            "error",
            "general",
            "slowquery"
          ],
          "deletion_protection": false,
          "associated_roles": []
        }
      ]
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
  end

  def test_clone_cluster
    Aws.config[:rds] = {
      stub_responses: {
        describe_db_clusters: @source_cluster,
        restore_db_cluster_to_point_in_time: @clone_cluster_response,
        # The 1st stub returns @source_instance when `clone_cluster` is getting information about the instance to clone.
        # The 2nd stub returns @create_instance_complete when the waiter checks to see if it has been provisioned.
        describe_db_instances: [@source_instance, @create_instance_complete],
        create_db_instance: @create_instance_response
      }
    }

    Cdo::RDS.clone_cluster(source_cluster_id: @source_cluster_id, clone_cluster_id: @clone_cluster_id)
  end

  def test_delete_cluster
    Aws.config[:rds] = {
      stub_responses: {
        describe_db_clusters: [@cluster_to_delete, 'DBClusterNotFoundFault'],
        delete_db_instance: @delete_instance_response,
        describe_db_instances: 'DBInstanceNotFoundFault',
        delete_db_cluster: @delete_cluster_response
      }
    }

    Cdo::RDS.delete_cluster(@cluster_to_delete_id)
  end
end
