require_relative('../../dashboard/config/environment')

class ContactRollupsV2
  def self.build_contact_rollups(log_collector)
    # Set opt_in based on information collected in Dashboard Email Preference.
    log_collector.time!("truncate_raw_contacts") {ContactRollupsRaw.truncate_raw_contacts}
    log_collector.time!("extract_email_preferences") {ContactRollupsRaw.extract_email_preferences}
  end
end
