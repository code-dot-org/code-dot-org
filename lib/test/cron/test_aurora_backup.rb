require_relative '../test_helper'
require 'cron/aurora_backup'
require 'aws-sdk-rds'

class AuroraBackupTest < Minitest::Test
  def test_find_latest_snapshot
    rds_resource = Aws::RDS::Resource.new(stub_responses: true)
    rds_resource.client.stub_responses(:describe_db_clusters,
      {
        db_clusters: [
          {db_cluster_identifier: 'my-cluster'},
        ]
      }
    )
    rds_resource.client.stub_responses(:describe_db_cluster_snapshots,
      {
        db_cluster_snapshots: [
          {
            db_cluster_snapshot_identifier: 'old-valid-snapshot',
            status: 'available',
            snapshot_create_time: Time.new(0)
          },
          {
            db_cluster_snapshot_identifier: 'latest-valid-snapshot',
            status: 'available',
            snapshot_create_time: Time.new(1)
          },
          {
            db_cluster_snapshot_identifier: 'creating-snapshot',
            status: 'creating',
            snapshot_create_time: Time.new(2)
          },
          {
            db_cluster_snapshot_identifier: "#{AuroraBackup::TEMP_SNAPSHOT_PREFIX}-123",
            status: 'available',
            snapshot_create_time: Time.new(3)
          }
        ]
      }
    )

    result = AuroraBackup.find_latest_snapshot(rds_resource, 'my-cluster')
    assert_equal result.db_cluster_snapshot_identifier, 'latest-valid-snapshot'
  end

  def test_no_automated_snapshot_found
    rds_resource = Aws::RDS::Resource.new(stub_responses: true)
    rds_resource.client.stub_responses(:describe_db_clusters,
      {
        db_clusters: [
          {db_cluster_identifier: 'my-cluster'},
        ]
      }
    )
    rds_resource.client.stub_responses(:describe_db_cluster_snapshots,
      {
        db_cluster_snapshots: []
      }
    )

    err = assert_raises AuroraBackup::AuroraBackupError do
      AuroraBackup.find_latest_snapshot(rds_resource, 'my-cluster')
    end
    assert_match /No available automated snapshots/, err.message
  end

  def test_share_snapshot_with_account
    temp_snapshot_name = 'my-temp-snapshot'
    backup_account_id = '123'

    snapshot_client = Aws::RDS::Client.new(stub_responses: true)
    snapshot_client.stub_responses(:copy_db_cluster_snapshot,
      {
        db_cluster_snapshot:
          {
            db_cluster_snapshot_identifier: temp_snapshot_name,
            db_cluster_identifier: 'my-cluster',
            status: 'available'
          }
      }
    )
    latest_snapshot = Aws::RDS::DBClusterSnapshot.new(cluster_id: 'my-cluster',
      snapshot_id: 'latest-snapshot',
      client: snapshot_client
    )
    rds_client = Minitest::Mock.new
    rds_client.expect :modify_db_cluster_snapshot_attribute, nil,
      attribute_name: 'restore',
      db_cluster_snapshot_identifier: temp_snapshot_name,
      values_to_add: [backup_account_id]

    result = AuroraBackup.share_snapshot_with_account(rds_client, backup_account_id, latest_snapshot, temp_snapshot_name)
    assert_equal result.snapshot_id, temp_snapshot_name
  end

  def test_find_shared_snapshot_on_backup
    temp_snapshot_name = 'my-temp-snapshot'
    shared_snapshot_id = "arn:aws:rds:us-east-1:1234567890:cluster-snapshot:rds:#{temp_snapshot_name}"

    rds_client = Aws::RDS::Client.new(stub_responses: true)
    rds_client.stub_responses(:describe_db_cluster_snapshots,
      {
        db_cluster_snapshots: [
          {
            db_cluster_snapshot_identifier: 'some-other-snapshot',
            db_cluster_identifier: 'some-other-cluster',
            status: 'available',
            snapshot_create_time: Time.new(0)
          },
          {
            db_cluster_snapshot_identifier: shared_snapshot_id,
            db_cluster_identifier: 'my-cluster',
            status: 'available',
            snapshot_create_time: Time.new(1)
          }
        ]
      }
    )

    result = AuroraBackup.find_shared_snapshot_on_backup(rds_client, temp_snapshot_name)
    assert_equal result.snapshot_id, shared_snapshot_id
  end

  def test_copy_shared_snapshot
    copied_snapshot_name = 'copied-snasphot'

    snapshot_client = Aws::RDS::Client.new(stub_responses: true)
    snapshot_client.stub_responses(:copy_db_cluster_snapshot,
      {
        db_cluster_snapshot:
          {
            db_cluster_snapshot_identifier: copied_snapshot_name,
            db_cluster_identifier: 'my-cluster',
            status: 'available'
          }
      }
    )
    shared_snapshot = Aws::RDS::DBClusterSnapshot.new(cluster_id: 'my-cluster',
      snapshot_id: 'shared-snapshot',
      client: snapshot_client
    )

    result = AuroraBackup.copy_shared_snapshot(shared_snapshot, copied_snapshot_name)
    assert_equal result.snapshot_id, copied_snapshot_name
  end
end
