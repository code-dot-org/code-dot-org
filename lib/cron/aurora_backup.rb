require 'aws-sdk-rds'
require 'pry'

module AuroraBackup
  TEMP_SNAPSHOT_PREFIX = 'temp-snapshot'
  SHARED_KMS_KEY = 'alias/snapshot-DATA-production'

  # Raised when a snapshot that we expected to show up in the backup account
  # is not found within the timeout period (60 seconds)
  class AuroraBackupError < StandardError
  end

  # Wait for an RDS snapshot to be in the 'available' state
  # @param snapshot [DBClusterSnapshot] the snapshot to wait for
  def wait_for_snapshot(snapshot)
    # Wait up to 300 * 60 seconds = 300 minutes for snapshot to become available.
    snapshot.wait_until(max_attempts: 300, delay: 60) do |snap|
      snap.status == 'available'
    end
  rescue Aws::Waiters::Errors::WaiterFailed
    raise AuroraBackupError, "Timed out waiting for RDS snapshot #{snapshot.db_cluster_snapshot_identifier} to be available"
  end

  # Find a shared snapshot by name
  # @param rds_backup [Aws::RDS::Resource] the RDS resource
  # @param temp_snapshot_name [String] The name of the snapshot to look for. Note that
  # this is a suffix lookup, and assumes that the prefix will be 'arn:aws:rds:' for a
  # shared snapshot
  def find_shared_snapshot_on_backup(rds_client_backup, temp_snapshot_name)
    shared_snapshots = []
    attempts = 0
    max_attempts = 60
    until shared_snapshots.count > 0
      sleep(1)
      attempts += 1
      if attempts > max_attempts
        raise AuroraBackupError, 'Could not find shared snapshot after 60 seconds'
      end

      # Aws::RDS::Resource does not support listing cluster snapshots, so we must use Aws::RDS::Client API calls
      resp = rds_client_backup.describe_db_cluster_snapshots(max_records: 100, include_shared: true)
      shared_snapshots = resp.db_cluster_snapshots.select do |snap|
        snap.db_cluster_snapshot_identifier == temp_snapshot_name
      end
    end

    # Convert from data structure returned by Client API into Resource-style object
    Aws::RDS::DBClusterSnapshot.new(cluster_id: shared_snapshots.first.db_cluster_identifier,
                                    snapshot_id: shared_snapshots.first.db_cluster_snapshot_identifier,
                                    client: rds_client_backup)
  end

  # Share an automated RDS snapshot with the account specified by the passed credentials.
  # This method will copy the automate snapshot to a manual one, and it should be deleted
  # later, outside this method.
  # @param backup_account_id [String] backup account ID
  # @param latest_snapshot [DBSnapshot] snapshot to copy and share
  # @return Array(DBSnapshot, String) the temporary copied snapshot, and the name of the
  # temporary snapshot
  def share_snapshot_with_account(rds_client, backup_account_id, latest_snapshot, temp_snapshot_name)
    # Copy the automated backup into a shareable manual one
    copied_snapshot = latest_snapshot.copy(
        target_db_cluster_snapshot_identifier: temp_snapshot_name,
        kms_key_id: SHARED_KMS_KEY
    )
    wait_for_snapshot(copied_snapshot)

    # Aws::RDS::DBClusterSnapshot does not appear to support this operation, so we must use Aws::RDS::Client
    rds_client.modify_db_cluster_snapshot_attribute(
        attribute_name: 'restore',
        db_cluster_snapshot_identifier: copied_snapshot.db_cluster_snapshot_identifier,
        values_to_add: [backup_account_id]
    )

    # Share the new snapshot with the backup account
    return copied_snapshot
  end

  def find_latest_snapshot(rds_resource, cluster_id)
    production_cluster = rds_resource.db_clusters.find {|i| i.id == cluster_id}

    # Find the latest automated backup
    sorted_snapshots = production_cluster.snapshots.
        select {|snap| snap.status == 'available' && !snap.db_cluster_snapshot_identifier.start_with?(TEMP_SNAPSHOT_PREFIX)}.
        sort_by(&:snapshot_create_time)

    if not sorted_snapshots.any?
      raise AuroraBackupError, "No available automated snapshots found for #{cluster_id}"
    end

    sorted_snapshots.last
  end

  def copy_shared_snapshot(shared_snapshot, new_snapshot_id)
    backed_up_snapshot = shared_snapshot.copy({
       target_db_cluster_snapshot_identifier: new_snapshot_id,
       kms_key_id: 'alias/aws/rds' # Use default master key
    })
    wait_for_snapshot(backed_up_snapshot)
    backed_up_snapshot
  end

  # This script pushes backup snapshots of our production database into a
  # write-only backup account, with the following steps:
  #
  # 1) Copy the latest automated snapshot to a temporary manual one
  # 2) Wait until ready, and share the manual snapshot with the backup acct
  # 3) On the backup account, copy the shared snapshot to a manual one
  # 4) Wait until ready, and finally go back to the main account and delete the temp snapshot
  #
  # Credential sets must be set up with the names 'default' and 'backup' in the aws config directory,
  # which requires setting appropriate secrets in our Chef config (which will come through via crontab.erb)
  def backup_latest_snapshot(rds_client, rds_client_backup, backup_account_id)
    rds_resource = Aws::RDS::Resource.new(client: rds_client)
    temp_snapshot_name = "#{TEMP_SNAPSHOT_PREFIX}-#{Time.now.to_i}"

    latest_snapshot = find_latest_snapshot(rds_resource, 'production-aurora-cluster')
    copied_snapshot = share_snapshot_with_account(rds_client, backup_account_id, latest_snapshot, temp_snapshot_name)
    copied_snapshot_backup = find_shared_snapshot_on_backup(rds_client_backup, temp_snapshot_name)
    copy_shared_snapshot(copied_snapshot_backup, latest_snapshot.db_cluster_snapshot_identifier.sub('rds:', ''))
  ensure
    if copied_snapshot
      copied_snapshot.delete
    end
  end
end