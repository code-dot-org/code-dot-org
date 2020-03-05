require File.expand_path('../../../pegasus/src/env', __FILE__)
require 'state_abbr'
require src_dir 'database'
require_relative('../../dashboard/config/environment')
require 'cdo/properties'
require 'json'

class ContactRollupsV2
  def self.build_contact_rollups(log_collector)
    # Set opt_in based on information collected in Dashboard Email Preference.
    update_email_preferences
  end

  def self.update_email_preferences
    # ben to do: add batching
    EmailPreference.all.each do |email_preference|
      raw_contact = {
        email: email_preference.email,
        sources: 'dashboard_production.email_preferences',
        data: {opt_in: email_preference.opt_in}.to_json,
        data_updated_at: email_preference.updated_at
      }
      # ben to do: handle if required fields are missing, or if there's a duplicate?
      RawContact.create! raw_contact
    end
  end
end
