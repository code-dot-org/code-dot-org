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

  def self.extract_email_preferences(limit = nil)
    select_query = <<-SQL
      SELECT email, opt_in, updated_at FROM email_preferences
    SQL
    select_query += "LIMIT #{limit}" unless limit.nil?

    query = get_extraction_query('dashboard.email_preferences', select_query, 'opt_in')
    ContactRollupsV2.execute_query_in_transaction(query)
  end

  def self.extract_parent_emails(limit = nil)
    source_sql = <<~SQL
      SELECT parent_email AS email, 1 AS is_parent, MAX(updated_at) AS updated_at
      FROM users
      WHERE parent_email > ''
      GROUP BY parent_email
    SQL
    source_sql += "LIMIT #{limit}" unless limit.nil?

    query = get_extraction_query('dashboard.users', source_sql, 'is_parent')
    ContactRollupsV2.execute_query_in_transaction(query)
  end

  def self.extract_scripts_taught(limit = nil)
    source_sql = <<~SQL
      SELECT
        u.email,
        sc.properties->'$.curriculum_umbrella' AS curriculum_umbrella,
        ug.name AS course_name,
        MAX(se.updated_at) AS updated_at
      FROM sections AS se
      JOIN users AS u ON se.user_id = u.id
      JOIN scripts AS sc ON sc.id = se.script_id
      LEFT JOIN course_scripts AS cs ON cs.script_id = se.script_id
      LEFT JOIN unit_groups AS ug ON ug.id = cs.course_id
      WHERE u.email > ''
      GROUP BY u.email, sc.name, ug.name
    SQL
    source_sql += "LIMIT #{limit}" unless limit.nil?

    query = get_extraction_query('dashboard.sections', source_sql, 'curriculum_umbrella', 'course_name')
    ContactRollupsV2.execute_query_in_transaction(query)
  end

  def self.extract_courses_taught(limit = nil)
    source_sql = <<~SQL
      SELECT u.email, unit_groups.name AS course_name, MAX(se.updated_at) AS updated_at
      FROM users AS u
      JOIN sections AS se ON se.user_id = u.id
      JOIN unit_groups ON unit_groups.id = se.course_id
      WHERE u.email > ''
      GROUP BY u.email, unit_groups.name
    SQL
    source_sql += "LIMIT #{limit}" unless limit.nil?

    query = get_extraction_query('dashboard.sections', source_sql, 'course_name')
    ContactRollupsV2.execute_query_in_transaction(query)
  end

  def self.extract_professional_learning_attendance_old_attendance_model(limit = nil)
    # "section_type" is not null only in cases where sections was used for
    # PD attendance. It's always null when a section represents an actual
    # classroom of students (the vast majority of rows in the sections table).
    source_sql = <<~SQL
      SELECT u.email, se.section_type, MAX(GREATEST(se.updated_at, f.updated_at)) AS updated_at
        FROM users AS u
        JOIN followers AS f ON u.id = f.student_user_id
        JOIN sections AS se ON f.section_id = se.id
        WHERE u.email > ''
        AND se.section_type IS NOT NULL
      GROUP BY 1,2
    SQL
    source_sql += "LIMIT #{limit}" unless limit.nil?

    query = get_extraction_query('dashboard.followers', source_sql, 'section_type')
    ContactRollupsV2.execute_query_in_transaction(query)
  end

  def self.extract_professional_learning_attendance_new_attendance_model(limit = nil)
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
    source_sql += "LIMIT #{limit}" unless limit.nil?

    query = get_extraction_query('dashboard.pd_attendances', source_sql, 'course')
    ContactRollupsV2.execute_query_in_transaction(query)
  end

  def self.extract_roles_from_user_permissions(limit = nil)
    source_sql = <<~SQL
      SELECT u.email, up.permission, up.updated_at
      FROM user_permissions AS up
      JOIN users AS u ON u.id = up.user_id
      WHERE u.email > ''
    SQL
    source_sql += "LIMIT #{limit}" unless limit.nil?

    query = get_extraction_query('dashboard.user_permissions', source_sql, 'permission')
    ContactRollupsV2.execute_query_in_transaction(query)
  end

  def self.extract_users_and_geos(limit = nil)
    # An user can have many user_geos records. user_geos records starts with only NULL
    # values until a cronjob runs, does IP-to-address lookup, and update them later.
    teacher_and_geo_query = <<~SQL
      SELECT
        t.email, t.id AS user_id,
        ug.city, ug.state, ug.postal_code, ug.country,
        MAX(GREATEST(t.updated_at, IFNULL(ug.updated_at, t.updated_at))) AS updated_at
      FROM (#{teacher_query('id, email, updated_at')}) AS t
      LEFT OUTER JOIN user_geos AS ug ON t.id = ug.user_id
      GROUP BY email, t.id, city, state, postal_code, country
    SQL
    teacher_and_geo_query += "LIMIT #{limit}" unless limit.nil?

    extraction_query = get_extraction_query(
      'dashboard.users',
      teacher_and_geo_query,
      'user_id', 'city', 'state', 'postal_code', 'country'
    )
    ContactRollupsV2.execute_query_in_transaction(extraction_query)
  end

  def self.extract_pd_enrollments(limit = nil)
    enrollment_email_query = <<~SQL
      SELECT
        e.email,
        w.course,
        MAX(GREATEST(e.updated_at, IFNULL(w.updated_at, e.updated_at))) AS updated_at
      FROM pd_enrollments AS e
      LEFT OUTER JOIN pd_workshops AS w ON e.pd_workshop_id = w.id
      WHERE email > ''
      GROUP BY email, course
    SQL
    enrollment_email_query += "LIMIT #{limit}" unless limit.nil?

    extraction_query = get_extraction_query('dashboard.pd_enrollments', enrollment_email_query, 'course')
    ContactRollupsV2.execute_query_in_transaction(extraction_query)
  end

  def self.extract_census_submissions(limit = nil)
    submitter_query = <<~SQL
      SELECT submitter_email_address AS email, submitter_role, MAX(updated_at) AS updated_at
      FROM census_submissions
      WHERE submitter_email_address > ''
      GROUP BY submitter_email_address, submitter_role
    SQL
    submitter_query += "LIMIT #{limit}" unless limit.nil?

    extraction_query = get_extraction_query('dashboard.census_submissions', submitter_query, 'submitter_role')
    ContactRollupsV2.execute_query_in_transaction(extraction_query)
  end

  def self.extract_school_geos(limit = nil)
    school_geos_query = <<~SQL
      SELECT
        t.email,
        s.city, s.state, s.zip,
        MAX(GREATEST(s.updated_at, si.updated_at, t.updated_at)) AS updated_at
      FROM schools AS s
      INNER JOIN school_infos AS si ON s.id = si.school_id
      INNER JOIN (#{teacher_query('email, school_info_id, updated_at')}) AS t ON si.id = t.school_info_id
      GROUP BY email, city, state, zip
    SQL
    school_geos_query += "LIMIT #{limit}" unless limit.nil?

    extraction_query = get_extraction_query(
      'dashboard.schools',
      school_geos_query,
      'city', 'state', 'zip'
    )
    ContactRollupsV2.execute_query_in_transaction(extraction_query)
  end

  # @param limit [Integer, String] maximum number of rows to extract
  def self.extract_pegasus_forms(limit = nil)
    # This query will extract student emails from pegasus.forms. Most of them come from
    # students older than 16 via Petition submissions. However, there are about 167K
    # emails from students between 13 and 16 who submitted petitions before May 2018.
    #
    # We started to anonymize emails from students younger than 16 since May 2018 because
    # of GDPR requirements. We always anonymize emails from students younger than 13.
    #
    # @see:
    #   https://code.org/privacy#studentemails
    #   pegasus/sites.v3/code.org/views/petition_expand.haml
    #   bin/oneoff/wipe_data/opt_out_petition_emails_under_16
    #
    forms_query = <<~SQL
      SELECT email, kind, data->>'$.role_s' AS role, MAX(updated_at) AS updated_at
      FROM #{CDO.pegasus_db_name}.forms
      WHERE email > '' AND email != 'anonymous@code.org'
      GROUP BY email, kind, role
    SQL
    forms_query += "LIMIT #{limit}" unless limit.nil?

    extraction_query = get_extraction_query(
      'pegasus.forms',
      forms_query,
      'kind', 'role'
    )
    ContactRollupsV2.execute_query_in_transaction(extraction_query)
  end

  # @param limit [Integer, String] maximum number of rows to extract
  def self.extract_pegasus_form_geos(limit = nil)
    form_geos_query = <<~SQL
      SELECT
        f.email,
        fg.city, fg.state, fg.postal_code, fg.country,
        MAX(fg.updated_at) AS updated_at
      FROM #{CDO.pegasus_db_name}.forms AS f
      INNER JOIN #{CDO.pegasus_db_name}.form_geos AS fg ON f.id = fg.form_id
      WHERE email > '' AND email != 'anonymous@code.org'
      GROUP BY email, city, state, postal_code, country
    SQL
    form_geos_query += "LIMIT #{limit}" unless limit.nil?

    extraction_query = get_extraction_query(
      'pegasus.form_geos',
      form_geos_query,
      'city', 'state', 'postal_code', 'country'
    )
    ContactRollupsV2.execute_query_in_transaction(extraction_query)
  end

  # @param limit [Integer, String] maximum number of rows to extract
  def self.extract_pegasus_contacts(limit = nil)
    # pegasus.contacts contains emails collected from pegasus.forms and
    # dashboard.census_submissions (using +Poste2.create_recipient+ method).
    # Those emails are already extracted, we only care about +unsubscribed_at+ column here.
    #
    # @Note: pegasus.contacts has duplicate emails even though its migration says
    # email is unique. Thus, we still have to de-duplicate emails.
    contact_query = <<~SQL
      SELECT email, MAX(unsubscribed_at) AS unsubscribed_at, MAX(updated_at) AS updated_at
      FROM #{CDO.pegasus_db_name}.contacts
      WHERE email > ''
        AND email != 'anonymous@code.org'
        AND unsubscribed_at IS NOT NULL
      GROUP BY email
    SQL
    contact_query += "LIMIT #{limit}" unless limit.nil?

    extraction_query = get_extraction_query('pegasus.contacts', contact_query, 'unsubscribed_at')
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

  # @param source_name [String] The source table contains data we want to extract
  # @param select_query [String] Query to select data from the source table
  # @param data_columns [String] Columns we want reshaped into a single JSON object
  # @return [String] A SQL statement to extract and reshape data from the source table.
  def self.get_extraction_query(source_name, select_query, *data_columns)
    <<~SQL
      INSERT INTO #{ContactRollupsRaw.table_name}
        (email, sources, data, data_updated_at, created_at, updated_at)
      SELECT
        email,
        '#{source_name}' AS sources,
        #{create_json_object(data_columns)} AS data,
        updated_at AS data_updated_at,
        NOW() AS created_at,
        NOW() AS updated_at
      FROM (#{select_query}) AS subquery
      WHERE email > ''
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
