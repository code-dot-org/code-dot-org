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

CSF_SCRIPT_ARRAY = %w(
  course1
  course2
  course3
  course4
  coursea-2017
  courseb-2017
  coursec-2017
  coursed-2017
  coursee-2017
  coursef-2017
  coursea-2018
  courseb-2018
  coursec-2018
  coursed-2018
  coursee-2018
  coursef-2018
  coursea-2019
  courseb-2019
  coursec-2019
  coursed-2019
  coursee-2019
  coursef-2019
  coursea-2020
  courseb-2020
  coursec-2020
  coursed-2020
  coursee-2020
  coursef-2020
  20-hour
  express-2017
  pre-express-2017
  express-2018
  pre-express-2018
  express-2019
  pre-express-2019
  express-2020
  pre-express-2020
).freeze

CSF_SCRIPT_LIST = CSF_SCRIPT_ARRAY.map {|x| "'#{x}'"}.join(',')

COURSES_TAUGHT_ARRAY = %w(
  csd-2017
  csd-2018
  csd-2019
  csd-2020
  csp-2017
  csp-2018
  csp-2019
  csp-2020
)

COURSES_TAUGHT_LIST = COURSES_TAUGHT_ARRAY.map {|x| "'#{x}'"}.join(',')

class ContactRollupsRaw < ApplicationRecord
  self.table_name = 'contact_rollups_raw'

  def self.extract_email_preferences
    query = get_extraction_query('email_preferences', 'email', ['opt_in'])
    ContactRollupsV2.execute_query_in_transaction(query)
  end

  def self.extract_parent_emails
    source_sql = <<~SQL
      SELECT parent_email, MAX(updated_at) AS updated_at
      FROM users
      GROUP BY parent_email
    SQL
    query = get_extraction_query(source_sql, 'parent_email', [], true, 'dashboard.users.parent_email')
    ContactRollupsV2.execute_query_in_transaction(query)
  end

  def self.extract_scripts_taught
    source_sql = <<~SQL
      SELECT email, scripts.name, MAX(se.updated_at) AS updated_at
      FROM users u
      JOIN sections se ON se.user_id = u.id
      JOIN scripts ON scripts.id = se.script_id
      WHERE scripts.name in (#{CSF_SCRIPT_LIST})
      AND email > ''
      GROUP BY email, scripts.name
    SQL

    query = get_extraction_query(source_sql, 'email', ['name'], true, 'dashboard.sections.script_id')
    ContactRollupsV2.execute_query_in_transaction(query)
  end

  def self.extract_courses_taught
    source_sql = <<~SQL
      SELECT email, courses.name, MAX(se.updated_at) AS updated_at
      FROM users u
      JOIN sections se ON se.user_id = u.id
      JOIN courses ON courses.id = se.course_id
      WHERE courses.name in (#{COURSES_TAUGHT_LIST})
      AND email > ''
      GROUP BY email, courses.name
    SQL

    query = get_extraction_query(source_sql, 'email', ['name'], true, 'dashboard.sections.course_id')
    ContactRollupsV2.execute_query_in_transaction(query)
  end

  # @param source [String] Source from which we want to extract data (can be a dashboard table name, or subquery)
  # @param email_column [String] Column in source table we want to insert ino the email column
  # @param data_columns [Array] Columns we want reshaped into a single JSON object
  # @param source_is_subquery [Boolean] (default false) Set to true if source is a subquery, rather than a table name
  # @param source_name [String] (default nil) Name for source (non-nil if using a subquery)
  # @return [String] A SQL statement to extract and reshape data from the source table.
  def self.get_extraction_query(source, email_column, data_columns, source_is_subquery=false, source_name=nil)
    if source_name.nil? && source_is_subquery
      raise 'Source name required if source is a subquery'
    end

    source_name ||= "dashboard.#{source}"
    wrapped_source = source_is_subquery ? "(#{source}) AS subquery" : source

    <<~SQL
      INSERT INTO #{ContactRollupsRaw.table_name} (email, sources, data, data_updated_at, created_at, updated_at)
      SELECT
        #{email_column},
        '#{source_name}' AS sources,
        #{create_json_object(data_columns)} AS data,
        updated_at AS data_updated_at,
        NOW() AS created_at,
        NOW() AS updated_at
      FROM #{wrapped_source}
      WHERE #{email_column} IS NOT NULL AND #{email_column} != ''
    SQL
  end

  # Generates a string with the MySQL syntax used in a SELECT statement
  # to create a JSON object out of multiple database columns.
  # @example
  #   Input: ['age', 'name', 'email']
  #   Output: "JSON_OBJECT('age', age, 'name', name, 'email', email)"
  # @param columns [Array] Column names to reshape
  # @return [String] MySQL JSON_OBJECT() syntax for insertion
  def self.create_json_object(columns)
    return 'NULL' if columns.empty?

    'JSON_OBJECT(' + columns.map {|col| "'#{col}',#{col}"}.join(',') + ')'
  end
end
