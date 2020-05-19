require 'cdo/log_collector'

class ContactRollupsV2
  def initialize(is_dry_run: true)
    @is_dry_run = is_dry_run
    @log_collector = LogCollector.new('Contact Rollups')
  end

  def collect_and_process_contacts
    number_of_extractions = 2
    successful_extraction_count = 0

    @log_collector.time_and_raise!('Deletes intermediate content from previous runs') do
      truncate_or_delete_table ContactRollupsRaw
      truncate_or_delete_table ContactRollupsProcessed
    end

    @log_collector.time_and_continue('Extracts data from dashboard email_preferences') do
      ContactRollupsRaw.extract_email_preferences
      successful_extraction_count += 1
    end

    @log_collector.time_and_continue('Extracts parent emails from dashboard.users') do
      ContactRollupsRaw.extract_parent_emails
      successful_extraction_count += 1
    end

    # If all extractions fail, there is no reason to continue.
    return unless successful_extraction_count
    @log_collector.time_and_raise!('Processes all extracted data') do
      ContactRollupsProcessed.import_from_raw_table
    end

    # Update the final table only if all the steps above have passed to avoid saving incomplete data.
    if successful_extraction_count != number_of_extractions
      @log_collector.info("Skips overwriting contact_rollups_final_table")
      return
    end

    @log_collector.time_and_raise!("Overwrites contact_rollups_final table") do
      truncate_or_delete_table ContactRollupsFinal
      ContactRollupsFinal.insert_from_processed_table
    end
  rescue StandardError => e
    @log_collector.record_exception(e)
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
