class ContactRollupsV2
  def self.build_contact_rollups(log_collector)
    # Set opt_in based on information collected in Dashboard Email Preference.
    log_collector.time!('ContactRollupsRaw.truncate_table') {ContactRollupsRaw.truncate_table}
    log_collector.time!('ContactRollupsRaw.extract_email_preferences') {ContactRollupsRaw.extract_email_preferences}

    log_collector.time!('ContactRollupsProcessed.delete_all') {ContactRollupsProcessed.delete_all}
    log_collector.time!('ContactRollupsProcessed.import_from_raw_table') {ContactRollupsProcessed.import_from_raw_table}

    log_collector.time!('ContactRollupsComparison.delete_all') {ContactRollupsComparison.delete_all}
    log_collector.time!('ContactRollupsComparison.compare_processed_data') {ContactRollupsComparison.compile_processed_data}

    log_collector.time!('ContactRollupsPardotMemory.add_and_update_pardot_ids') {ContactRollupsPardotMemory.add_and_update_pardot_ids}

    # TODO: sync upstream step
  end
end
