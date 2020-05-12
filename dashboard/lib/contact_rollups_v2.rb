require 'cdo/log_collector'

class ContactRollupsV2
  def initialize(is_dry_run: true)
    @is_dry_run = is_dry_run
    @log_collector = LogCollector.new
  end

  def collect_and_process_contacts
    @log_collector.time!('Deletes intermediate content from previous runs') do
      truncate_or_delete_table ContactRollupsRaw
      truncate_or_delete_table ContactRollupsProcessed
    end

    @log_collector.time!('Extracts data from dashboard email_preferences') do
      ContactRollupsRaw.extract_email_preferences
    end

    @log_collector.time!('Extracts parent emails from dashboard.users') do
      ContactRollupsRaw.extract_parent_emails
    end

    @log_collector.time!('Processes all extracted data') do
      ContactRollupsProcessed.import_from_raw_table
    end

    @log_collector.time!("Overwrites contact_rollups_final table") do
      truncate_or_delete_table ContactRollupsFinal
      ContactRollupsFinal.insert_from_processed_table
    end
  end

  def sync_contacts_with_pardot
    unless @is_dry_run
      @log_collector.time!('Downloads new email-Pardot ID mappings') do
        ContactRollupsPardotMemory.download_pardot_ids
      end
    end

    @log_collector.time!('Creates new Pardot prospects') do
      ContactRollupsPardotMemory.create_new_pardot_prospects(is_dry_run: @is_dry_run)
    end

    @log_collector.time!('Updates existing Pardot prospects') do
      ContactRollupsPardotMemory.update_pardot_prospects(is_dry_run: @is_dry_run)
    end

    unless @is_dry_run
      @log_collector.time!('Downloads new email-Pardot ID mappings (again)') do
        ContactRollupsPardotMemory.download_pardot_ids
      end
    end
  end

  def report_results
    # TODO: Add reporting to log file, slack channel and AWS CloudWatch.
    puts @log_collector
  end

  private

  # Using truncate allows us to re-use row IDs,
  # which is important in production so we don't overflow the table.
  # Deletion is required in test environments, as tests generally do
  # not allow you to execute TRUNCATE statements.
  def truncate_or_delete_table(model)
    CDO.rack_env == :production ? truncate_table(model) : model.delete_all
  end

  def truncate_table(model)
    ActiveRecord::Base.connection.execute("TRUNCATE TABLE #{model.table_name}")
  end
end
