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

  def self.overwrite_from_processed_table
    truncate
    insert_from_processed_table
  end

  def self.truncate
    ActiveRecord::Base.connection.truncate('contact_rollups_final')
  end

  def self.insert_from_processed_table
    overwrite_sql = <<~SQL
      INSERT INTO contact_rollups_final
      SELECT *
      FROM contact_rollups_processed;
    SQL

    ActiveRecord::Base.connection.exec_query(overwrite_sql)
  end
end
