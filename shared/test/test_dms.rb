require 'minitest/autorun'
require_relative 'test_helper'
require 'active_support/core_ext/object/deep_dup'
require 'cdo/aws/dms'
require 'aws-sdk-databasemigrationservice'

class TestDMS < Minitest::Test
  def setup
    @task_arn = 'arn:aws:dms:us-east-1:1234567890:task:ABCDEFGHIJKL'

    @task_starting = {
      "replication_task_identifier": "my-favorite-task",
      "source_endpoint_arn": "arn:aws:dms:us-east-1:1234567890:task:ABCDEFGHIJKL",
      "target_endpoint_arn": "arn:aws:dms:us-east-1:1234567890:task:ZYXWVUTSRQPO",
      "replication_instance_arn": "arn:aws:dms:us-east-1:1234567890:task:LKJIHGFEDCBA",
      "migration_type": "full-load",
      "table_mappings": "{\"escapedJSON\": true}",
      "replication_task_settings": "{\"escapedJSON\": true}",
      "status": "starting",
      "stop_reason": "",
      "replication_task_creation_date": Time.parse("2020-01-01T00:00:00.000-00:00"),
      "replication_task_start_date": Time.parse("2020-01-01T16:20:00.000-00:00"),
      "replication_task_arn": @task_arn,
      "replication_task_stats": {
        "full_load_progress_percent": 0,
        "elapsed_time_millis": 1,
        "tables_loaded": 0,
        "tables_loading": 0,
        "tables_queued": 2,
        "tables_errored": 0
      }
    }

    @task_running = @task_starting.deep_merge(
      {
        status: 'running',
        replication_task_stats: {
          elapsed_time_millis: 1000,
          tables_queued: 0,
          tables_loading: 2,
          full_load_progress_percent: 30
        }
      }
    )

    @task_completed_successfully = @task_starting.deep_merge(
      {
        status: 'stopped',
        stop_reason: 'Stop Reason FULL_LOAD_ONLY_FINISHED',
        replication_task_stats: {
          elapsed_time_millis: 2000,
          tables_queued: 0,
          tables_loaded: 2,
          full_load_progress_percent: 100
        }
      }
    )

    @task_completed_successfully_table_statistics = [
      {
        "schema_name": "my_favorite_schema",
        "table_name": "my_favorite_table",
        "inserts": 0,
        "deletes": 0,
        "updates": 0,
        "ddls": 0,
        "full_load_rows": 2_147_483_647,
        "full_load_condtnl_chk_failed_rows": 0,
        "full_load_error_rows": 0,
        "last_update_time": Time.parse("2020-01-01T17:20:00.000-00:00"),
        "table_state": "Table completed",
        "validation_pending_records": 0,
        "validation_failed_records": 0,
        "validation_suspended_records": 0,
        "validation_state": "Not enabled"
      },
      {
        "schema_name": "my_favorite_schema",
        "table_name": "my_bestie_table",
        "inserts": 0,
        "deletes": 0,
        "updates": 0,
        "ddls": 0,
        "full_load_rows": 314159,
        "full_load_condtnl_chk_failed_rows": 0,
        "full_load_error_rows": 0,
        "last_update_time": Time.parse("2020-01-01T17:21:00.000-00:00"),
        "table_state": "Table completed",
        "validation_pending_records": 0,
        "validation_failed_records": 0,
        "validation_suspended_records": 0,
        "validation_state": "Not enabled"
      }
    ]

    @task_completed_unsuccessfully = @task_starting.deep_merge(
      {
        status: 'stopped',
        stop_reason: 'Stop Reason FULL_LOAD_ONLY_FINISHED',
        replication_task_stats: {
          elapsed_time_millis: 2000,
          tables_loading: 1,
          tables_loaded: 1,
          full_load_progress_percent: 74
        }
      }
    )

    @task_completed_unsuccessfully_table_statistics = @task_completed_successfully_table_statistics.deep_dup
    @task_completed_unsuccessfully_table_statistics[0].deep_merge({"table_state": "Before load"})

    @start_task_response = {
      "migration_type": "full-load",
      "replication_instance_arn": "arn:aws:dms:us-east-1:1234567890:task:LKJIHGFEDCBA",
      "replication_task_arn": @task_arn,
      "replication_task_creation_date": Time.parse("2020-01-01T00:00:00.000-00:00"),
      "replication_task_identifier": "my-favorite-task",
      "replication_task_settings": "{\"escapedJSON\": true}",
      "source_endpoint_arn": "arn:aws:dms:us-east-1:1234567890:task:ABCDEFGHIJKL",
      "status": "starting",
      "table_mappings": "{\"escapedJSON\": true}",
      "target_endpoint_arn": "arn:aws:dms:us-east-1:1234567890:task:ZYXWVUTSRQPO"
    }
  end

  def test_replication_task_status
    dms_client = Aws::DatabaseMigrationService::Client.new(
      stub_responses:
      {
        describe_replication_tasks: {"replication_tasks": [@task_completed_successfully]},
        describe_table_statistics:
          {
            "replication_task_arn": @task_arn,
            "table_statistics": @task_completed_successfully_table_statistics
          }
      }
    )

    task_status = Cdo::DMS::ReplicationTask.new(@task_arn, dms_client).status
    assert_equal 'stopped', task_status.status
    assert task_status.stop_reason.include?('FULL_LOAD_ONLY_FINISHED')
    assert_equal 0, task_status.tables_errored
    assert_equal 'Table completed', task_status[:table_statistics][0][:table_state]
    assert_equal 314159, task_status[:table_statistics][1][:full_load_rows]
  end

  def test_start_replication_task_that_completes_successfully
    dms_client = Aws::DatabaseMigrationService::Client.new(
      stub_responses:
      {
        start_replication_task: {replication_task: @start_task_response},
        describe_replication_tasks: {"replication_tasks": [@task_completed_successfully]},
        describe_table_statistics:
          {
            "replication_task_arn": @task_arn,
            "table_statistics": @task_completed_successfully_table_statistics
          }
      }
    )

    task = Cdo::DMS::ReplicationTask.new(@task_arn, dms_client)
    task.start(1, 1)
  end

  def test_start_replication_task_that_completes_unsuccessfully
    dms_client = Aws::DatabaseMigrationService::Client.new(
      stub_responses:
      {
        start_replication_task: {replication_task: @start_task_response},
        describe_replication_tasks: {"replication_tasks": [@task_completed_unsuccessfully]},
        describe_table_statistics:
          {
            "replication_task_arn": @task_arn,
            "table_statistics": @task_completed_unsuccessfully_table_statistics
          }
      }
    )

    task = Cdo::DMS::ReplicationTask.new(@task_arn, dms_client)

    assert_raises(StandardError) do
      task.start(1, 1)
    end
  end
end
