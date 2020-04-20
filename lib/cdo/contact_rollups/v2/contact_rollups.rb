class ContactRollupsV2
  def self.build_contact_rollups(log_collector, pardot_steps=false)
    log_collector.time!('Truncate tables') do
      ContactRollupsRaw.truncate_table
      ContactRollupsProcessed.truncate_table
    end

    log_collector.time!('Extracts data from dashboard email_preferences') do
      ContactRollupsRaw.extract_from_table('email_preferences', ['opt_in'], 'email')
    end

    log_collector.time!('Processes all extracted data') do
      ContactRollupsProcessed.import_from_raw_table
    end

    log_collector.time!('Compares new and previously processed data') do
      ContactRollupsComparison.delete_all
      ContactRollupsComparison.compile_processed_data
    end

    if pardot_steps
      log_collector.time!('Downloads new email-Pardot ID mappings') do
        ContactRollupsPardotMemory.add_and_update_pardot_ids
      end
      log_collector.time!('Creates new Pardot prospects') do
        ContactRollupsPardotMemory.create_new_pardot_prospects
      end
      log_collector.time!('Updates existing Pardot prospects') do
        ContactRollupsPardotMemory.update_pardot_prospects
      end
    end

    log_collector.time!("Overwrites contact_rollups_final table") do
      ContactRollupsFinal.overwrite_from_processed_table
    end
  end
end
