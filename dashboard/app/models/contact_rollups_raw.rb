# == Schema Information
#
# Table name: contact_rollups_raw
#
#  id              :integer          not null, primary key
#  email           :string(255)      not null
#  sources         :string(255)      not null
#  data            :json
#  data_updated_at :datetime         not null
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#
# Indexes
#
#  index_contact_rollups_raw_on_email_and_sources  (email,sources) UNIQUE
#

class ContactRollupsRaw < ApplicationRecord
  self.table_name = 'contact_rollups_raw'

  def self.truncate_table
    ActiveRecord::Base.connection.execute("TRUNCATE TABLE #{table_name}")
  end

  def self.extract_email_preferences
    EmailPreference.all.find_in_batches(batch_size: 1000) do |email_preference_batch|
      raw_contacts = []
      email_preference_batch.each do |email_preference|
        raw_contact = {
          email: email_preference.email,
          sources: "dashboard.#{EmailPreference.table_name}",
          data: {opt_in: email_preference.opt_in},
          data_updated_at: email_preference.updated_at
        }
        raw_contacts << raw_contact
      end

      # ben to do: handle if required fields are missing, or if there's a duplicate?
      # currently will fail if any required fields are missing
      import! raw_contacts
    end
  end
end
