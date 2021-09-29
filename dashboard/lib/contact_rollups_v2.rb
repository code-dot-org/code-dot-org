require 'cdo/log_collector'
require 'honeybadger/ruby'

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

  attr_accessor :limit

  # @param is_dry_run [Boolean] If true, do not send requests to Pardot and do not
  #   update ContactRollupsPardotMemory table.
  # @param limit_extraction [Integer] The maximum number of rows to get from each
  #   extraction method. The default value is nil, which means getting all rows.
  def initialize(is_dry_run: false, limit_extraction: nil)
    @is_dry_run = is_dry_run
    @limit = limit_extraction
    @log_collector = LogCollector.new('ContactRollupsV2')
    @log_collector.info("Initialization params: "\
      "is_dry_run: #{is_dry_run}, "\
      "limit_extraction = #{limit_extraction || 'nil'}"
    )
    self.class.set_db_variables
  end

  # Build contact rollups and sync the results to Pardot.
  def build_and_sync
    collect_contacts
    process_contacts
    # These sync steps are independent, one could fail without affecting another.
    # However, if the build steps above fail, none of them should run.
    sync_new_contacts_with_pardot
    sync_updated_contacts_with_pardot
    delete_contacts_from_pardot
  end

  # Collects raw contact data from multiple tables into ContactRollupsRaw.
  def collect_contacts
    start_time = Time.now
    @log_collector.time!('Deletes intermediate content from previous runs') do
      truncate_or_delete_table ContactRollupsRaw
      truncate_or_delete_table ContactRollupsProcessed
    end

    # Extract pegasus data
    unless Rails.env.test?
      @log_collector.time!('extract_pegasus_forms') {ContactRollupsRaw.extract_pegasus_forms(@limit)}
      @log_collector.time!('extract_pegasus_form_geos') {ContactRollupsRaw.extract_pegasus_form_geos(@limit)}
      @log_collector.time!('extract_pegasus_contacts') {ContactRollupsRaw.extract_pegasus_contacts(@limit)}
    end

    # Extract dashboard data
    @log_collector.time!('extract_email_preferences') {ContactRollupsRaw.extract_email_preferences(@limit)}
    @log_collector.time!('extract_parent_emails') {ContactRollupsRaw.extract_parent_emails(@limit)}
    @log_collector.time!('extract_scripts_taught') {ContactRollupsRaw.extract_scripts_taught(@limit)}
    @log_collector.time!('extract_courses_taught') {ContactRollupsRaw.extract_courses_taught(@limit)}
    @log_collector.time!('extract_roles_from_user_permissions') {ContactRollupsRaw.extract_roles_from_user_permissions(@limit)}
    @log_collector.time!('extract_users_and_geos') {ContactRollupsRaw.extract_users_and_geos(@limit)}
    @log_collector.time!('extract_pd_enrollments') {ContactRollupsRaw.extract_pd_enrollments(@limit)}
    @log_collector.time!('extract_census_submissions') {ContactRollupsRaw.extract_census_submissions(@limit)}
    @log_collector.time!('extract_school_geos') {ContactRollupsRaw.extract_school_geos(@limit)}
    @log_collector.time!('extract_professional_learning_attendance_old') do
      ContactRollupsRaw.extract_professional_learning_attendance_old_attendance_model(@limit)
    end
    @log_collector.time!('extract_professional_learning_attendance_new') do
      ContactRollupsRaw.extract_professional_learning_attendance_new_attendance_model(@limit)
    end
  ensure
    @log_collector.record_metrics(
      {CollectContactsDuration: Time.now - start_time}
    )
  end

  # Process contacts in ContactRollupsRaw table and save the results to ContactRollupsProcessed.
  # The results are then copied over to ContactRollupsFinal for further analysis.
  def process_contacts
    start_time = Time.now
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
      {ProcessContactsDuration: Time.now - start_time}
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

  def delete_contacts_from_pardot
    start_time = Time.now
    @log_collector.time_and_continue('Delete contacts marked for deletion from Pardot') do
      results = ContactRollupsPardotMemory.delete_pardot_prospects(is_dry_run: @is_dry_run)
      @log_collector.record_metrics(
        ProspectsDeleted: results[:prospects_deleted],
        ProspectDeletionsRejected: results[:prospect_deletions_rejected]
      )
    end
  ensure
    @log_collector.record_metrics(
      {DeleteContactsDuration: Time.now - start_time}
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

  # Send logs, metrics, and exceptions to external systems such as
  # AWS S3, CloudWatch, Slack and Honeybadger.
  # Skip if in dry-run mode.
  def report_results
    @log_collector.record_metrics(get_table_metrics)
    unless @is_dry_run
      upload_metrics
      url = upload_to_s3
      report_to_slack log_url: url
      @log_collector.exceptions.each {|e| Honeybadger.notify(e)}
    end

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

  # @return [String] url of the uploaded S3 object
  def upload_to_s3
    log_name = "crv2-#{Time.now.utc.strftime('%Y%m%dT%H%M%SZ')}.log"
    AWS::S3::LogUploader.
      new('cdo-audit-logs', "contact-rollups-v2/#{CDO.rack_env}").
      upload_log(log_name, @log_collector.to_s)
  end

  # @return [Boolean, nil] true/false if a summary message is sent to Slack or not,
  #   nil if CDO.hip_chat_logging is not enabled.
  def report_to_slack(log_url: nil)
    duration = @log_collector.metrics.values_at(
      :CollectContactsDuration,
      :ProcessContactsDuration,
      :SyncNewContactsDuration,
      :SyncUpdatedContactsDuration
    ).compact.sum
    formatted_duration = Time.at(duration).utc.strftime("%Hh:%Mm:%Ss")

    log_link = "<a href='#{log_url}'>:cloud: Log on S3</a>"

    cloud_watch_link =
      "<a href='https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#dashboards:name=Contact-Rollups-V2'>"\
      ":chart_with_upwards_trend: CloudWatch dashboard</a>"

    summary = [
      "*ContactRollupsV2* (#{CDO.rack_env}#{', dry-run' if @is_dry_run})",
      "Number of Pardot prospects created: #{@log_collector.metrics[:ProspectsCreated]}",
      "Number of Pardot prospects updated: #{@log_collector.metrics[:ProspectsUpdated]}",
      "Number of contacts in ContactRollupsFinal: #{@log_collector.metrics[:FinalRows]}",
      ":clock10: #{formatted_duration} #{log_link} #{cloud_watch_link}"
    ].join("\n")

    ChatClient.message 'cron-daily', summary
  end

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
