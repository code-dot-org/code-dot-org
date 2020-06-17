require 'cdo/log_collector'

class ContactRollupsV2
  MAX_EXECUTION_TIME_SEC = 18_000

  DASHBOARD_DB_WRITER = sequel_connect(
    CDO.dashboard_db_writer,
    CDO.dashboard_db_reader,
    query_timeout: MAX_EXECUTION_TIME_SEC
  )

  # Execute a SQL query in a transaction in the dashboard database.
  # Does not return query results.
  # The query uses a Sequel or ActiveRecord connection depends on the current Rails environment.
  #
  # This method is used to write to the database.
  # @see +retrieve_query_results+ method to fetch data from the database.
  def self.execute_query_in_transaction(query)
    # For long-running queries, we use Sequel connection instead of ActiveRecord connection.
    # ActiveRecord has a default 30s read_timeout that we cannot override. Sequel allows us
    # to a create connection with custom query_timeout and read_timeout values.
    #
    # However, Sequel write operations to the dashboard database don't work in test environments
    # (in local, Drone, and test machine) and Rails console sandbox. In those environments,
    # all database operations are wrapped in a ActiveRecord transaction so they can be rolled
    # back later. Sequel write operations cannot acquire a lock to the dashboard database, which
    # already locked by ActiveRecord, then fail with "Lock wait timeout exceeded" error.
    #
    # The workaround is to use different database connections in different environments.
    if Rails.env.test?
      ActiveRecord::Base.transaction {ActiveRecord::Base.connection.exec_query(query)}
    else
      DASHBOARD_DB_WRITER.transaction {DASHBOARD_DB_WRITER.run(query)}
    end
  end

  # Execute a query in the dashboard database and returns query results.
  # The query uses a Sequel or ActiveRecord connection depends on the current Rails environment.
  #
  # This method is mostly used to read data from the database.
  # @see +execute_query_in_transaction+ method to simply execute a query in the database.
  def self.retrieve_query_results(query)
    # @see comments in +execute_query_in_transaction+ method for explanation
    # why we have to use ActiveRecord connection in a test environment.
    if Rails.env.test?
      ActiveRecord::Base.connection.exec_query(query)
    else
      # Sequel::Database#[] method returns a Sequel::Dataset, which fetch records only when needed.
      DASHBOARD_DB_WRITER[query]
    end
  end

  # Set all database configurations the pipeline will need
  def self.set_db_variables
    # Set group_concat_max_len to 65535 (same as VARCHAR max length).
    # Its default value is 1024, too short for the amount of data we need to concat.
    # @see:
    #   ContactRollupsProcessed.get_data_aggregation_query
    #   https://dev.mysql.com/doc/refman/5.7/en/server-system-variables.html#sysvar_group_concat_max_len
    DASHBOARD_DB_WRITER.run('SET SESSION group_concat_max_len = 65535')
  end

  def initialize(is_dry_run: false)
    @is_dry_run = is_dry_run
    @log_collector = LogCollector.new('ContactRollupsV2')
    self.class.set_db_variables
  end

  # Build contact rollups and sync the results to Pardot.
  def build_and_sync
    collect_and_process_contacts

    # These sync steps are independent, one could fail without affecting another.
    # However, if the build step above fails, none of them should run.
    sync_new_contacts_with_pardot
    sync_updated_contacts_with_pardot
  end

  # Collects raw contact data from multiple tables into ContactRollupsRaw.
  # Then, process them and save the results into ContactRollupsProcessed.
  # The results are copied over to ContactRollupsFinal to be used for further analysis.
  def collect_and_process_contacts
    start_time = Time.now
    @log_collector.time!('Deletes intermediate content from previous runs') do
      truncate_or_delete_table ContactRollupsRaw
      truncate_or_delete_table ContactRollupsProcessed
    end

    # Extract raw data
    @log_collector.time!('extract_pegasus_forms') {ContactRollupsRaw.extract_pegasus_forms}
    @log_collector.time!('extract_pegasus_form_geos') {ContactRollupsRaw.extract_pegasus_form_geos}
    @log_collector.time!('extract_pegasus_contacts') {ContactRollupsRaw.extract_pegasus_contacts}
    @log_collector.time!('extract_email_preferences') {ContactRollupsRaw.extract_email_preferences}
    @log_collector.time!('extract_parent_emails') {ContactRollupsRaw.extract_parent_emails}
    @log_collector.time!('extract_scripts_taught') {ContactRollupsRaw.extract_scripts_taught}
    @log_collector.time!('extract_courses_taught') {ContactRollupsRaw.extract_courses_taught}
    @log_collector.time!('extract_roles_from_user_permissions') {ContactRollupsRaw.extract_roles_from_user_permissions}
    @log_collector.time!('extract_users_and_geos') {ContactRollupsRaw.extract_users_and_geos}
    @log_collector.time!('extract_pd_enrollments') {ContactRollupsRaw.extract_pd_enrollments}
    @log_collector.time!('extract_census_submissions') {ContactRollupsRaw.extract_census_submissions}
    @log_collector.time!('extract_school_geos') {ContactRollupsRaw.extract_school_geos}
    @log_collector.time!('extract_professional_learning_attendance_old') do
      ContactRollupsRaw.extract_professional_learning_attendance_old_attendance_model
    end
    @log_collector.time!('extract_professional_learning_attendance_new') do
      ContactRollupsRaw.extract_professional_learning_attendance_new_attendance_model
    end

    @log_collector.time!('Processes all extracted data') do
      results = ContactRollupsProcessed.import_from_raw_table
      @log_collector.record_metrics({ContactsWithInvalidData: results[:invalid_contacts]})
    end

    @log_collector.time!("Overwrites contact_rollups_final table") do
      truncate_or_delete_table ContactRollupsFinal
      ContactRollupsFinal.insert_from_processed_table
    end
  ensure
    @log_collector.record_metrics(
      {CollectAndProcessContactsDuration: Time.now - start_time}
    )
  end

  def sync_new_contacts_with_pardot
    start_time = Time.now
    unless @is_dry_run
      @log_collector.time!('Downloads new email-Pardot ID mappings') do
        ContactRollupsPardotMemory.download_pardot_ids
      end
    end

    @log_collector.time!('Creates new Pardot prospects') do
      results = ContactRollupsPardotMemory.create_new_pardot_prospects(is_dry_run: @is_dry_run)
      @log_collector.record_metrics(
        {
          ProspectsCreated: results[:accepted_prospects],
          ProspectsRejected: results[:rejected_prospects],
          CreateAPICalls: results[:request_count]
        }
      )
    end

    unless @is_dry_run
      @log_collector.time!('Downloads new email-Pardot ID mappings (again)') do
        ContactRollupsPardotMemory.download_pardot_ids
      end
    end
  rescue StandardError => e
    @log_collector.record_exception e
  ensure
    @log_collector.record_metrics(
      {SyncNewContactsDuration: Time.now - start_time}
    )
  end

  def sync_updated_contacts_with_pardot
    start_time = Time.now
    @log_collector.time_and_continue('Updates existing Pardot prospects') do
      results = ContactRollupsPardotMemory.update_pardot_prospects(is_dry_run: @is_dry_run)
      @log_collector.record_metrics(
        {
          ProspectsUpdated: results[:updated_prospects],
          ProspectUpdatesRejected: results[:rejected_prospects],
          UpdateAPICalls: results[:request_count]
        }
      )
    end
  ensure
    @log_collector.record_metrics(
      {SyncUpdatedContactsDuration: Time.now - start_time}
    )
  end

  def get_table_metrics
    {
      RawRows: ContactRollupsRaw.count,
      ProcessedRows: ContactRollupsProcessed.count,
      FinalRows: ContactRollupsProcessed.count,
      PardotMemoryRows: ContactRollupsPardotMemory.count
    }
  end

  def print_logs
    CDO.log.info @log_collector
  end

  # Send logs and metrics to external systems such as AWS CloudWatch and Slack
  # unless in dry-run mode.
  def report_results
    @log_collector.record_metrics(get_table_metrics)
    upload_metrics unless @is_dry_run
    # TODO: Report to slack channel
    print_logs
  end

  # Upload pipeline metrics to AWS CloudWatch.
  # https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#dashboards:name=Contact-Rollups-V2
  def upload_metrics
    aws_metrics = @log_collector.metrics.map do |key, value|
      {
        metric_name: key,
        value: value,
        dimensions: [{name: "Environment", value: CDO.rack_env}]
      }
    end
    Cdo::Metrics.push('ContactRollupsV2', aws_metrics)
  end

  private

  # Using truncate allows us to re-use row IDs,
  # which is important in production so we don't overflow the table.
  # Deletion is required in test environments, as tests generally do
  # not allow you to execute TRUNCATE statements.
  def truncate_or_delete_table(model)
    CDO.rack_env == :test ? model.delete_all : truncate_table(model)
  end

  def truncate_table(model)
    ActiveRecord::Base.connection.truncate(model.table_name)
  end
end
