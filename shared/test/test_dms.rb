require 'minitest/autorun'
require_relative 'test_helper'
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

    @task_completed_success = @task_starting.deep_merge(
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
  end

  def test_replication_task_status
    Aws.config[:databasemigrationservice] = {
      stub_responses: {
        describe_replication_tasks: {"replication_tasks": [@task_completed_success]},
        describe_table_statistics:
          {
            "replication_task_arn": @task_arn,
            "table_statistics": [
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
          }
      }
    }

    task = Cdo::DMS.replication_task_status(@task_arn)
    assert_equal 'stopped', task.status
    assert task.stop_reason.include?('FULL_LOAD_ONLY_FINISHED')
    assert_equal 0, task.tables_errored
    assert_equal 'Table completed', task[:table_statistics][0][:table_state]
    assert_equal 314159, task[:table_statistics][1][:full_load_rows]
  end
end
