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

  def self.extract_from_table(source_table, columns)
    email_preferences_query = extract_from_table_query(source_table, columns)
    ActiveRecord::Base.connection.execute(email_preferences_query)
  end

  def self.extract_from_table_query(source_table, columns)
    now = Time.now.utc

    <<~SQL
      INSERT INTO #{ContactRollupsRaw.table_name} (email, sources, data, data_updated_at, created_at, updated_at)
      SELECT
        email,
        'dashboard.#{source_table}' as sources,
        #{extract_columns_into_mysql_json(columns)} as data,
        #{source_table}.updated_at as data_updated_at,
        '#{now.strftime('%Y-%m-%d %H:%M:%S')}' as created_at,
        '#{now.strftime('%Y-%m-%d %H:%M:%S')}' as updated_at
      FROM #{source_table}
    SQL
  end

  # params -- takes an array of column names
  # returns -- a MySQL string that can be used in a SELECT statement to return a list of
  def self.extract_columns_into_mysql_json(columns)
    last = columns.pop
    'JSON_OBJECT(' + columns.map {|column| "'#{column}', #{column}, "}.join + "'#{last}', #{last}" + ')'
  end
end
