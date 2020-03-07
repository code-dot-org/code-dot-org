require File.expand_path('../../../pegasus/src/env', __FILE__)
require 'state_abbr'
require src_dir 'database'
require_relative('../../dashboard/config/environment')
require 'cdo/properties'
require 'json'

class ContactRollupsV2
  def self.build_contact_rollups(log_collector)
    # Set opt_in based on information collected in Dashboard Email Preference.
    log_collector.time!("truncate_raw_contacts") {truncate_raw_contacts}
    log_collector.time!("extract_email_preferences") {extract_email_preferences}
  end

  def self.truncate_raw_contacts
    ActiveRecord::Base.connection.execute("TRUNCATE TABLE raw_contacts")
  end

  def self.extract_email_preferences
    EmailPreference.all.find_in_batches(batch_size: 1000) do |email_preference_batch|
      raw_contacts = []
      email_preference_batch.each do |email_preference|
        raw_contact = {
          email: email_preference.email,
          sources: 'dashboard_production.email_preferences',
          data: {opt_in: email_preference.opt_in}.to_json,
          data_updated_at: email_preference.updated_at
        }
        raw_contacts << raw_contact
      end

      # ben to do: handle if required fields are missing, or if there's a duplicate?
      # currently will fail if any required fields are missing
      RawContact.import! raw_contacts
    end
  end
end
