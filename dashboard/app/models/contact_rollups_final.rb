# == Schema Information
#
# Table name: contact_rollups_final
#
#  id         :integer          not null, primary key
#  email      :string(255)      not null
#  data       :json             not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_contact_rollups_final_on_email  (email) UNIQUE
#

class ContactRollupsFinal < ApplicationRecord
  self.table_name = 'contact_rollups_final'

  def self.insert_from_processed_table
    insert_sql = <<~SQL
      INSERT INTO #{table_name}
      SELECT *
      FROM contact_rollups_processed;
    SQL
    ContactRollupsV2.execute_query_in_transaction(insert_sql)
  end
end
