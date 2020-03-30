# == Schema Information
#
# Table name: contact_rollups_comparisons
#
#  id                  :integer          not null, primary key
#  email               :string(255)      not null
#  old_data            :json
#  old_data_updated_at :datetime
#  new_data            :json
#  new_data_updated_at :datetime
#  created_at          :datetime
#
# Indexes
#
#  index_contact_rollups_comparisons_on_email  (email) UNIQUE
#

class ContactRollupsComparison < ApplicationRecord
  # Compiles old and new processed data then saves the results, one row per email.
  def self.compile_processed_data
    # Since Mysql 5.7 doesn't support FULL OUTER JOIN, we will simulate a FULL OUTER JOIN
    # between contact_rollups_final (the old data) and contact_rollups_processed (the new data).

    # Finds all records in the old data
    find_existing_records_query = <<-SQL.squish
      SELECT old.email, old.data, old.updated_at, new.data, new.updated_at, now()
      FROM contact_rollups_final AS old
      LEFT OUTER JOIN contact_rollups_processed AS new
      ON old.email = new.email
    SQL

    # Finds all records in the new data but not in the old data
    find_new_records_query = <<-SQL.squish
      SELECT new.email, old.data, old.updated_at, new.data, new.updated_at, now()
      FROM contact_rollups_final AS old
      RIGHT OUTER JOIN contact_rollups_processed AS new
      ON old.email = new.email
      WHERE old.email IS NULL
    SQL

    # Saves results of the two queries above
    insert_records_query = <<-SQL.squish
      INSERT INTO #{ContactRollupsComparison.table_name}
        (email, old_data, old_data_updated_at, new_data, new_data_updated_at, created_at)
      #{find_existing_records_query}
      UNION ALL
      #{find_new_records_query}
    SQL

    ActiveRecord::Base.connection.exec_query(insert_records_query)
  end

  def self.sync_new_contacts_to_pardot
    # TODO: is it better to use association?
    # Get all new contacts from contact_rollups_comparisons
    # Join with contact_rollups_pardot_memory to find pardot_id
    new_contacts_query = <<-SQL.squish
      SELECT a.email, a.new_data AS data, b.pardot_id
      FROM contact_rollups_comparisons AS a
      LEFT OUTER JOIN contact_rollups_pardot_memory AS b
      ON a.email = b.email
      WHERE a.old_data_updated_at IS NULL
    SQL

    ActiveRecord::Base.connection.exec_query(new_contacts_query).each do |record|
      # TODO: Use new instance of PardotV2 client. PardotV2 acts as an output stream
      PardotV2.send_in_batch record['email'], record['data'], record['pardot_id']
    end
    PardotV2.flush
  end

  # TODO: sync contacts that change pardot mappings
  # TODO: sync contacts with updated content
  # TODO: sync deleted contacts
end
