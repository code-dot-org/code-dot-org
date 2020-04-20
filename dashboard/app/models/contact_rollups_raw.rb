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

  # Generates insert query to run, and runs that query once constructed.
  def self.extract_from_table(source_table, data_columns, email_column)
    email_preferences_query = extract_from_table_query(source_table, data_columns, email_column)
    ActiveRecord::Base.connection.execute(email_preferences_query)
  end

  # @param source_table [String] Table from which we want to extract data
  # @param data_columns [Array] Columns we want reshaped into a single JSON object
  # @param email_column [String] Column in source table we want to insert ino the email column
  # @return [String] A SQL statement to extract and reshape data from the source table.
  def self.extract_from_table_query(source_table, data_columns, email_column)
    # TO DO: what to do when an email appears multiple times in the same source?
    <<~SQL
      INSERT INTO #{ContactRollupsRaw.table_name} (email, sources, data, data_updated_at, created_at, updated_at)
      SELECT
        #{email_column},
        'dashboard.#{source_table}' AS sources,
        #{extract_columns_into_mysql_json(data_columns)} AS data,
        #{source_table}.updated_at AS data_updated_at,
        NOW() AS created_at,
        NOW() AS updated_at
      FROM #{source_table}
      WHERE #{email_column} IS NOT NULL AND #{email_column} != ''
    SQL
  end

  # @param columns [Array] Column names to reshape
  # @return [String] MySQL JSON_OBJECT() syntax for insertion
  def self.extract_columns_into_mysql_json(columns)
    return 'NULL' if columns.empty?

    last = columns.pop
    'JSON_OBJECT(' + columns.map {|column| "'#{column}', #{column}, "}.join + "'#{last}', #{last}" + ')'
  end
end
