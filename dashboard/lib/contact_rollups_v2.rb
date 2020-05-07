class ContactRollupsV2
  def self.build_contact_rollups(log_collector, sync_with_pardot=false)
    log_collector.time!('Deletes intermediate content from previous runs') do
      ContactRollupsRaw.delete_all
      ContactRollupsProcessed.delete_all
    end

    log_collector.time!('Extracts data from dashboard email_preferences') do
      ContactRollupsRaw.extract_email_preferences
    end

    log_collector.time!('Processes all extracted data') do
      ContactRollupsProcessed.import_from_raw_table
    end

    if sync_with_pardot
      log_collector.time!('Downloads new email-Pardot ID mappings') do
        ContactRollupsPardotMemory.download_pardot_ids
      end
      log_collector.time!('Creates new Pardot prospects') do
        ContactRollupsPardotMemory.create_new_pardot_prospects
      end
      log_collector.time!('Updates existing Pardot prospects') do
        ContactRollupsPardotMemory.update_pardot_prospects
      end
      log_collector.time!('Downloads new email-Pardot ID mappings (again)') do
        ContactRollupsPardotMemory.download_pardot_ids
      end
    end

    log_collector.time!("Overwrites contact_rollups_final table") do
      ContactRollupsFinal.overwrite_from_processed_table
    end
  end
end
