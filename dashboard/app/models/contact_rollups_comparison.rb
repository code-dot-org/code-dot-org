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
  # Compiles old and new processed data, one row per email.
  def self.compile_processed_data
    # Finds all records in the old data. They may not be in the new data.
    find_existing_records_query = <<-SQL.squish
      SELECT old_data.email, old_data.data, old_data.updated_at, new_data.data, new_data.updated_at, now()
      FROM contact_rollups_final AS old_data
      LEFT OUTER JOIN contact_rollups_processed AS new_data
      ON old_data.email = new_data.email
    SQL

    # Finds all records in the new data but not in the old data
    find_new_records_query = <<-SQL.squish
      SELECT new_data.email, old_data.data, old_data.updated_at, new_data.data, new_data.updated_at, now()
      FROM contact_rollups_final AS old_data
      RIGHT OUTER JOIN contact_rollups_processed AS new_data
      ON old_data.email = new_data.email
      WHERE old_data.email IS NULL
    SQL

    # Saves results of the two queries above
    insert_records_query = <<-SQL.squish
      INSERT INTO #{ContactRollupsComparison.table_name}
        (email, new_data, new_data_updated_at, old_data, old_data_updated_at, created_at)
      #{find_existing_records_query}
      UNION ALL
      #{find_new_records_query}
    SQL

    ActiveRecord::Base.connection.exec_query(insert_records_query)
  end
end
