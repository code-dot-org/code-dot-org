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
      SELECT u.email, sc.name, MAX(se.updated_at) AS updated_at
      FROM users AS u
      JOIN sections AS se ON se.user_id = u.id
      JOIN scripts AS sc ON sc.id = se.script_id
      WHERE u.email > ''
      GROUP BY u.email, sc.name
    SQL

    query = get_extraction_query(source_sql, 'email', ['name'], true, 'dashboard.sections.script_id')
    ContactRollupsV2.execute_query_in_transaction(query)
  end

  def self.extract_courses_taught
    source_sql = <<~SQL
      SELECT u.email, courses.name, MAX(se.updated_at) AS updated_at
      FROM users AS u
      JOIN sections AS se ON se.user_id = u.id
      JOIN courses ON courses.id = se.course_id
      WHERE u.email > ''
      GROUP BY u.email, courses.name
    SQL

    query = get_extraction_query(source_sql, 'email', ['name'], true, 'dashboard.sections.course_id')
    ContactRollupsV2.execute_query_in_transaction(query)
  end

  def self.extract_professional_learning_attendance_old_attendance_model
    source_sql = <<~SQL
      SELECT u.email, se.section_type, MAX(GREATEST(se.updated_at, f.updated_at)) AS updated_at
        FROM users AS u
        JOIN followers AS f on u.id = f.student_user_id
        JOIN sections AS se on f.section_id = se.id
        WHERE se.section_type in (
          'csins_workshop',
          'csina_workshop',
          'ecs_workshop',
          'csp_workshop',
          'csf_workshop'
        )
        AND u.email > ''
      GROUP BY 1,2
    SQL

    query = get_extraction_query(source_sql, 'email', ['section_type'], true, 'dashboard.followers')
    ContactRollupsV2.execute_query_in_transaction(query)
  end

  def self.extract_professional_learning_attendance_new_attendance_model
    source_sql = <<~SQL
      SELECT u.email, pdw.course, MAX(GREATEST(pda.updated_at, pds.updated_at, pdw.updated_at)) AS updated_at
        FROM pd_attendances AS pda
        JOIN pd_sessions AS pds ON pds.id = pda.pd_session_id and pds.deleted_at is null
        JOIN pd_workshops AS pdw ON pdw.id = pds.pd_workshop_id and pdw.deleted_at is null
        JOIN users AS u ON u.id = pda.teacher_id
        WHERE pdw.course in (
          'CS Fundamentals',
          'CS in Algebra',
          'CS in Science',
          'CS Principles',
          'Exploring Computer Science',
          'CS Discoveries'
        )
        AND pda.deleted_at is null
        AND u.email > ''
      GROUP BY 1,2
    SQL

    query = get_extraction_query(source_sql, 'email', ['course'], true, 'dashboard.pd_attendances')
    ContactRollupsV2.execute_query_in_transaction(query)
  end

  def self.extract_roles_from_user_permissions
    source_sql = <<~SQL
      SELECT u.email, up.permission, up.updated_at
      FROM user_permissions AS up
      JOIN users AS u on u.id = up.user_id
      WHERE up.permission in (
        'facilitator',
        'workshop_organizer',
        'district_contact'
      )
      AND u.email > ''
    SQL

    query = get_extraction_query(source_sql, 'email', ['permission'], true, 'dashboard.user_permissions')
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
