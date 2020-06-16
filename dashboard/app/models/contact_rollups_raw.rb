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
      WHERE parent_email > ''
      GROUP BY parent_email
    SQL
    query = get_extraction_query(source_sql, 'parent_email', [], true, 'dashboard.users.parent_email')
    ContactRollupsV2.execute_query_in_transaction(query)
  end

  def self.extract_scripts_taught
    source_sql = <<~SQL
      SELECT u.email, sc.name AS script_name, c.name AS course_name, MAX(se.updated_at) AS updated_at
      FROM sections AS se
      JOIN users AS u ON se.user_id = u.id
      JOIN scripts AS sc ON sc.id = se.script_id
      LEFT JOIN course_scripts AS cs ON cs.script_id = se.script_id
      LEFT JOIN courses AS c ON c.id = cs.course_id
      WHERE u.email > ''
      GROUP BY u.email, sc.name, c.name
    SQL

    query = get_extraction_query(source_sql, 'email', ['script_name', 'course_name'], true, 'dashboard.sections')
    ContactRollupsV2.execute_query_in_transaction(query)
  end

  def self.extract_courses_taught
    source_sql = <<~SQL
      SELECT u.email, courses.name AS course_name, MAX(se.updated_at) AS updated_at
      FROM users AS u
      JOIN sections AS se ON se.user_id = u.id
      JOIN courses ON courses.id = se.course_id
      WHERE u.email > ''
      GROUP BY u.email, courses.name
    SQL

    query = get_extraction_query(source_sql, 'email', ['course_name'], true, 'dashboard.sections')
    ContactRollupsV2.execute_query_in_transaction(query)
  end

  def self.extract_professional_learning_attendance_old_attendance_model
    # "section_type" is not null only in cases where sections was used for
    # PD attendance. It's always null when a section represents an actual
    # classroom of students (the vast majority of rows in the sections table).
    source_sql = <<~SQL
      SELECT u.email, se.section_type, MAX(GREATEST(se.updated_at, f.updated_at)) AS updated_at
        FROM users AS u
        JOIN followers AS f on u.id = f.student_user_id
        JOIN sections AS se on f.section_id = se.id
        WHERE u.email > ''
        AND se.section_type IS NOT NULL
      GROUP BY 1,2
    SQL

    query = get_extraction_query(source_sql, 'email', ['section_type'], true, 'dashboard.followers')
    ContactRollupsV2.execute_query_in_transaction(query)
  end

  def self.extract_professional_learning_attendance_new_attendance_model
    source_sql = <<~SQL
      SELECT u.email, pdw.course, MAX(GREATEST(pda.updated_at, pds.updated_at, pdw.updated_at)) AS updated_at
        FROM pd_attendances AS pda
        JOIN pd_sessions AS pds ON pds.id = pda.pd_session_id AND pds.deleted_at IS NULL
        JOIN pd_workshops AS pdw ON pdw.id = pds.pd_workshop_id AND pdw.deleted_at IS NULL
        JOIN users AS u ON u.id = pda.teacher_id
        WHERE pda.deleted_at is null
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
      WHERE u.email > ''
    SQL

    query = get_extraction_query(source_sql, 'email', ['permission'], true, 'dashboard.user_permissions')
    ContactRollupsV2.execute_query_in_transaction(query)
  end

  def self.extract_user_geos
    # An user can have many user_geos records. user_geos records starts with only NULL
    # values until a cronjob runs, does IP-to-address lookup, and update them later.
    teacher_geos_query = <<~SQL
      SELECT
        teachers.email,
        user_geos.city, user_geos.state, user_geos.postal_code, user_geos.country,
        MAX(user_geos.updated_at) as updated_at
      FROM (#{teacher_query('id, email')}) AS teachers
      JOIN user_geos
      ON teachers.id = user_geos.user_id
      GROUP BY email, city, state, postal_code, country
    SQL

    extraction_query = get_extraction_query(
      teacher_geos_query,
      'email',
      %w(city state postal_code country),
      true,
      'dashboard.user_geos'
    )
    ContactRollupsV2.execute_query_in_transaction(extraction_query)
  end

  def self.extract_pd_enrollments
    enrollment_email_query = <<~SQL
      SELECT email, MAX(updated_at) AS updated_at
      FROM pd_enrollments
      WHERE email > ''
      GROUP BY email
    SQL

    extraction_query = get_extraction_query(
      enrollment_email_query,
      'email',
      [],
      true,
      'dashboard.pd_enrollments'
    )
    ContactRollupsV2.execute_query_in_transaction(extraction_query)
  end

  def self.extract_census_submissions
    submitter_query = <<~SQL
      SELECT submitter_email_address, submitter_role, MAX(updated_at) AS updated_at
      FROM census_submissions
      WHERE submitter_email_address > ''
      GROUP BY submitter_email_address, submitter_role
    SQL

    extraction_query = get_extraction_query(
      submitter_query,
      'submitter_email_address',
      ['submitter_role'],
      true,
      'dashboard.census_submissions'
    )
    ContactRollupsV2.execute_query_in_transaction(extraction_query)
  end

  def self.extract_school_geos
    school_geos_query = <<~SQL
      SELECT email, city, state, zip, MAX(updated_at) AS updated_at
      FROM (
        SELECT
          teachers.email,
          schools.city, schools.state, schools.zip,
          GREATEST(teachers.updated_at, school_infos.updated_at, schools.updated_at) AS updated_at
        FROM (#{teacher_query('email, school_info_id, updated_at')}) AS teachers
        JOIN school_infos ON school_infos.id = teachers.school_info_id
        JOIN schools ON schools.id = school_infos.school_id
      ) AS inner_query
      GROUP BY email, city, state, zip
    SQL

    extraction_query = get_extraction_query(
      school_geos_query,
      'email',
      %w(city state zip),
      true,
      'dashboard.schools'
    )
    ContactRollupsV2.execute_query_in_transaction(extraction_query)
  end

  def self.extract_pegasus_form_geos
    # TODO: how to run this method in Rails end-to-end tests? It reads from pegasus tables.
    form_geos_query = <<~SQL
      SELECT
        forms.email,
        form_geos.city, form_geos.state, form_geos.postal_code, form_geos.country,
        MAX(form_geos.updated_at) AS updated_at
      FROM #{CDO.pegasus_db_name}.forms
      JOIN #{CDO.pegasus_db_name}.form_geos
      ON form_geos.form_id = forms.id
      WHERE email > ''
      GROUP BY email, city, state, postal_code, country
    SQL

    extraction_query = get_extraction_query(
      form_geos_query,
      'email',
      %w(city state postal_code country),
      true,
      'pegasus.form_geos'
    )
    ContactRollupsV2.execute_query_in_transaction(extraction_query)
  end

  def self.teacher_query(columns = '*')
    # This query selects only teacher accounts from the users table
    # because we don't store student email addresses at all.
    <<-SQL
      SELECT #{columns}
      FROM users
      WHERE email > ''
    SQL
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
