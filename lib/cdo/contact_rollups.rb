require File.expand_path('../../../pegasus/src/env', __FILE__)
require 'state_abbr'
require src_dir 'database'
require_relative('../../dashboard/config/environment')
require 'cdo/properties'
require 'json'

class ContactRollups
  # Connection to read from Pegasus production database.
  PEGASUS_DB_READER = sequel_connect(CDO.pegasus_db_reader, CDO.pegasus_db_reader)

  # Connection to write to Pegasus production database.
  PEGASUS_DB_WRITER = sequel_connect(CDO.pegasus_db_writer, CDO.pegasus_db_reader)

  # Connection to read from Pegasus reporting database.
  PEGASUS_REPORTING_DB_READER = sequel_connect(CDO.pegasus_reporting_db_reader, CDO.pegasus_reporting_db_reader)

  # Connection to write to Pegasus reporting database.
  PEGASUS_REPORTING_DB_WRITER = sequel_connect(CDO.pegasus_reporting_db_writer, CDO.pegasus_reporting_db_writer)

  # Columns to disregard
  EXCLUDED_COLUMNS = %w(id pardot_id pardot_sync_at updated_at).freeze

  UPDATE_BATCH_SIZE = 100

  PEGASUS_DB_NAME = "pegasus_#{Rails.env}"
  DASHBOARD_DB_NAME = "dashboard_#{Rails.env}"

  UNITED_STATES = "united states"

  # Table name of table structure to copy from to create the destination working table
  TEMPLATE_TABLE_NAME = "contact_rollups"
  # Table name of destination working table
  DEST_TABLE_NAME = "contact_rollups_daily"

  # List of valid PD courses. If more courses get added, need to update this list and also schema in Pardot. We
  # need to filter here to known courses in the Pardot schema - we can't blindly pass values through
  COURSE_LIST = "'CS Fundamentals','CS in Algebra','CS in Science','CS Principles','Exploring Computer Science','CS Discoveries'"

  # Values of forms.kind field we care about
  FORM_KINDS = %w(BringToSchool2013 CSEdWeekEvent2013 DistrictPartnerSubmission HelpUs2013 Petition K5OnlineProfessionalDevelopmentPostSurvey)

  # Information about presence of which forms submitted by a user get recorded in which
  # rollup field with which value
  FORM_INFOS =
    [
      {kind: "'CSEdWeekEvent2013'", dest_field: "hoc_organizer_years", dest_value: "'2013'"},
      {kind: "'HocSignup2014'", dest_field: "hoc_organizer_years", dest_value: "'2014'"},
      {kind: "'HocSignup2015'", dest_field: "hoc_organizer_years", dest_value: "'2015'"},
      {kind: "'HocSignup2016'", dest_field: "hoc_organizer_years", dest_value: "'2016'"},
      {kind: "'Petition'", dest_field: "roles", dest_value: "'Petition Signer'"}
    ].freeze

  def self.build_contact_rollups
    start = Time.now

    ActiveRecord::Base.connection.execute "SET SQL_SAFE_UPDATES = 0"
    # set READ UNCOMMITTED transaction isolation level to avoid taking locks on tables we are reading from during
    # what can be multi-minute operations
    ActiveRecord::Base.connection.execute "SET SESSION TRANSACTION ISOLATION LEVEL READ UNCOMMITTED"
    create_destination_table
    insert_from_pegasus_forms
    insert_from_dashboard_contacts
    insert_from_dashboard_pd_enrollments
    insert_from_pegasus_contacts
    update_roles
    update_grades_taught
    update_ages_taught
    update_district
    update_school
    update_courses_facilitated
    update_professional_learning_enrollment
    update_professional_learning_attendance

    # record contacts' interactions with us based on forms
    FORM_INFOS.each do |form_info|
      append_to_list_field_from_form(form_info[:kind], form_info[:dest_field], form_info[:dest_value])
    end

    # parse all forms that collect user-reported address/location data
    FORM_KINDS.each do |kind|
      update_geo_data_from_forms(kind)
    end

    count = ActiveRecord::Base.connection.execute("select count(*) from pegasus_test.contact_rollups_daily").first[0]
    log "Done. Total overall time: #{Time.now - start} seconds. #{count} records created in contact_rollups_daily table."
  end

  def self.sync_contact_rollups_to_main
    log("#{Time.now} Starting")

    num_inserts = 0
    num_updates = 0
    num_unchanged = 0

    # We use raw SQL in the queries below in order to include FORCE INDEX, which turns out to be necessary to make
    # MySQL use the email index to sort by email.

    # Query all of the contacts in the latest daily contact rollup table (contact_rollups_daily) sorted by email.
    contact_rollups_src = PEGASUS_REPORTING_DB_READER['SELECT * FROM contact_rollups_daily FORCE INDEX(contact_rollups_email_index) ORDER BY email']
    # Query all of the contacts in the master contact rollup table (contact_rollups_daily) sorted by email.
    contact_rollups_dest = PEGASUS_DB_READER['SELECT * FROM contact_rollups FORCE INDEX(contact_rollups_email_index) ORDER BY email']

    # Create iterators for both queries using the #stream method so we stream the results back rather than
    # trying to load everything in memory
    src_iterator = contact_rollups_src.stream.to_enum
    dest_iterator = contact_rollups_dest.stream.to_enum

    # Do a row-by-row comparison of the new daily contact rollup (src) against the existing (dest) and calculate
    # the differences. Make inserts or updates to make dest match src. Wherever we do an insert or an update,
    # mark the updated_at timestamp so we track what rows have changed at what time, to enable efficient sync
    # into Pardot.

    contact_rollup_src = grab_next(src_iterator)
    contact_rollup_dest = grab_next(dest_iterator)
    until contact_rollup_src.nil?
      email_src = contact_rollup_src[:email]

      # Continue to advance the destination pointer until the destination email address in question
      # is the same or later alphabetically as the source email address.
      while (!contact_rollup_dest.nil?) && (contact_rollup_dest[:email] < email_src)
        contact_rollup_dest = grab_next(dest_iterator)
      end

      # Determine if this is a new record (email address doesn't exist in destination table) or existing.
      is_new = true
      unless contact_rollup_dest.nil?
        email_dest = contact_rollup_dest[:email]
        # Compare email addresses of source and destination row to see if they are the same.
        # IF not, the source record is new.
        is_new = email_src.casecmp(email_dest) != 0
      end

      # Build the set of column data that needs to be inserted/updated
      output_row = {}
      contact_rollup_src.each do |column, value|
        # Skip columns that include sync metadata
        next if EXCLUDED_COLUMNS.include? column.to_s

        # If this is not a new record, skip columns where the data already matches
        next if !is_new && (value == contact_rollup_dest[column])

        # Add the source data to the same column in the destination row
        output_row[column] = value
      end

      # If there are no columns to update, then this is an existing record where the
      # destination is the same as the source, nothing to do
      if output_row.empty?
        num_unchanged += 1
      else
        # Track the timestamp of the change, so the sync process knows this change needs to be synced
        output_row[:updated_at] = Time.now

        if is_new
          # Insert the destination record
          # log("#{Time.now} Inserted #{email_src} (src id: #{contact_rollup_src[:id]})")
          PEGASUS_DB_WRITER[:contact_rollups].insert(output_row)
          num_inserts += 1
        else
          # Update the destination record
          # log("#{Time.now} Update #{email_src} (src id: #{contact_rollup_src[:id]}; updated: #{output_row})")
          PEGASUS_DB_WRITER[:contact_rollups].where(email: email_src).update(output_row)
          num_updates += 1
        end
      end

      # Go on to the next source record
      contact_rollup_src = grab_next(src_iterator)
    end

    num_total = num_inserts + num_updates + num_unchanged
    log("#{Time.now} Completed. #{num_total} source rows processed. #{num_inserts} insert(s), #{num_updates} update(s), #{num_unchanged} unchanged.")
  end

  def self.create_destination_table
    start = Time.now
    log "Creating destination table"
    # Ensure destination table exists and is empty. Since this code runs on the reporting replica and the destination
    # table should exist only there, we can't use a migration to create it. Create the destination table explicitly in code.
    # Create it based on master contact_rollups table. Create it every time to keep up with schema changes in contact_rollups.
    PEGASUS_REPORTING_DB_WRITER.run "DROP TABLE IF EXISTS #{DEST_TABLE_NAME}"
    PEGASUS_REPORTING_DB_WRITER.run "CREATE TABLE #{DEST_TABLE_NAME} LIKE #{TEMPLATE_TABLE_NAME}"
    log_completion(start)
  end

  def self.log(s)
    puts s unless Rails.env.test?
    CDO.log.info s
  end

  def self.log_completion(start)
    log "   Completed in #{Time.now - start} seconds"
  end

  def self.insert_from_dashboard_contacts
    start = Time.now
    log "Inserting teacher contacts and IP geo data from dashboard.users"
    PEGASUS_REPORTING_DB_WRITER.run "
    INSERT INTO #{PEGASUS_DB_NAME}.#{DEST_TABLE_NAME} (email, name, dashboard_user_id, roles, city, state, postal_code, country)
    SELECT email COLLATE utf8_general_ci, name, users.id, 'Teacher', city, state, postal_code, country FROM #{DASHBOARD_DB_NAME}.users AS users
    LEFT OUTER JOIN #{DASHBOARD_DB_NAME}.user_geos AS user_geos ON user_geos.user_id = users.id
    WHERE users.user_type = 'teacher' AND LENGTH(email) > 0 AND user_geos.indexed_at IS NOT NULL
    ON DUPLICATE KEY UPDATE #{DEST_TABLE_NAME}.name = VALUES(name), #{DEST_TABLE_NAME}.dashboard_user_id = VALUES(dashboard_user_id)"
    log_completion(start)
  end

  def self.insert_from_dashboard_pd_enrollments
    start = Time.now
    log "Inserting contacts from dashboard.pd_enrollments"
    PEGASUS_REPORTING_DB_WRITER.run "
    INSERT INTO #{PEGASUS_DB_NAME}.#{DEST_TABLE_NAME} (email, name)
    SELECT email, name FROM #{DASHBOARD_DB_NAME}.pd_enrollments AS pd_enrollments
    WHERE LENGTH(pd_enrollments.email) > 0
    ON DUPLICATE KEY UPDATE name = #{DEST_TABLE_NAME}.name"
    log_completion(start)
  end

  def self.insert_from_pegasus_contacts
    start = Time.now
    log "Inserting contacts from pegasus.contacts"
    PEGASUS_REPORTING_DB_WRITER.run "
    INSERT INTO #{PEGASUS_DB_NAME}.#{DEST_TABLE_NAME} (email, opted_out, name)
    SELECT email, IF(unsubscribed_at IS null, null, true) AS opted_out, name FROM #{PEGASUS_DB_NAME}.contacts WHERE LENGTH(email) > 0
    ON DUPLICATE KEY UPDATE #{DEST_TABLE_NAME}.name = VALUES(name)"
    log_completion(start)
  end

  def self.insert_from_pegasus_forms
    start = Time.now
    log "Inserting contacts and IP geo data from pegasus.forms"
    PEGASUS_REPORTING_DB_WRITER.run "
    INSERT IGNORE INTO #{PEGASUS_DB_NAME}.#{DEST_TABLE_NAME} (email, name, city, state, postal_code, country)
    SELECT email, name, city, state, postal_code, country FROM #{PEGASUS_DB_NAME}.forms
    LEFT OUTER JOIN #{PEGASUS_DB_NAME}.form_geos on form_geos.form_id = forms.id
    WHERE form_geos.indexed_at IS NOT NULL"
    log_completion(start)
  end

  def self.update_roles
    start = Time.now
    log "Updating Facilitator, Workshop Organizer, District Contact roles from dashboard.users"
    append_to_role_list_from_permission("facilitator", "Facilitator")
    append_to_role_list_from_permission("workshop_organizer", "Workshop Organizer")
    append_to_role_list_from_permission("district_contact", "District Contact")
    log_completion(start)

    start = Time.now
    log "Updating Professional Learning Partner role"
    append_plp_to_role_list
    log_completion(start)
  end

  def self.append_to_role_list_from_permission(permission_name, dest_value)
    PEGASUS_REPORTING_DB_WRITER.run "
    UPDATE #{PEGASUS_DB_NAME}.#{DEST_TABLE_NAME}
    INNER JOIN #{DASHBOARD_DB_NAME}.users AS users ON users.id = #{PEGASUS_DB_NAME}.#{DEST_TABLE_NAME}.dashboard_user_id
    INNER JOIN #{DASHBOARD_DB_NAME}.user_permissions AS user_permissions ON user_permissions.user_id = users.id
    SET roles = CONCAT(COALESCE(CONCAT(roles, ','), ''), '#{dest_value}')
    WHERE LENGTH(users.email) > 0
    AND user_permissions.permission = '#{permission_name}' AND #{DEST_TABLE_NAME}.id > 0"
  end

  def self.append_to_list_field_from_form(form_kinds, dest_field, dest_value)
    start = Time.now
    log "Appending '#{dest_field}' field with #{dest_value} from forms of kind #{form_kinds}"

    PEGASUS_REPORTING_DB_WRITER.run "
    UPDATE #{PEGASUS_DB_NAME}.#{DEST_TABLE_NAME}
    INNER JOIN #{PEGASUS_DB_NAME}.forms ON forms.email = #{PEGASUS_DB_NAME}.#{DEST_TABLE_NAME}.email
    SET #{dest_field} = CONCAT(COALESCE(CONCAT(#{dest_field}, ','), ''), #{dest_value})
    WHERE forms.kind IN (#{form_kinds}) AND #{DEST_TABLE_NAME}.id > 0"
    log_completion(start)
  end

  def self.append_plp_to_role_list
    PEGASUS_REPORTING_DB_WRITER.run "
    UPDATE #{PEGASUS_DB_NAME}.#{DEST_TABLE_NAME}
    INNER JOIN #{DASHBOARD_DB_NAME}.users AS users ON users.id = #{PEGASUS_DB_NAME}.#{DEST_TABLE_NAME}.dashboard_user_id
    INNER JOIN #{DASHBOARD_DB_NAME}.professional_learning_partners AS professional_learning_partners ON professional_learning_partners.contact_id = users.id
    SET roles = CONCAT(COALESCE(CONCAT(roles, ','), ''), 'PLP')
    WHERE LENGTH(users.email) > 0 AND #{DEST_TABLE_NAME}.id > 0"
  end

  def self.update_courses_facilitated
    start = Time.now
    log "Updating courses_facilitated"
    PEGASUS_REPORTING_DB_WRITER.run "
    UPDATE #{PEGASUS_DB_NAME}.#{DEST_TABLE_NAME},
    (SELECT facilitator_id, GROUP_CONCAT(course) AS courses FROM
      (SELECT DISTINCT facilitator_id, course FROM #{DASHBOARD_DB_NAME}.pd_course_facilitators
        WHERE COURSE IN (#{COURSE_LIST})
        ORDER by 1,2
      ) q
      GROUP BY facilitator_id
    ) src
    SET #{DEST_TABLE_NAME}.courses_facilitated = src.courses
    WHERE #{DEST_TABLE_NAME}.dashboard_user_id = src.facilitator_id"
    log_completion(start)
  end

  def self.update_professional_learning_enrollment
    start = Time.now
    log "Updating professional learning enrollment"
    PEGASUS_REPORTING_DB_WRITER.run "
    UPDATE #{PEGASUS_DB_NAME}.#{DEST_TABLE_NAME},
      (SELECT user_id, GROUP_CONCAT(course) AS courses FROM
         (SELECT DISTINCT pd_enrollments.user_id, pd_workshops.course FROM #{DASHBOARD_DB_NAME}.pd_enrollments AS pd_enrollments
            INNER JOIN #{DASHBOARD_DB_NAME}.pd_workshops AS pd_workshops ON pd_workshops.id = pd_enrollments.pd_workshop_id
            WHERE course IN (#{COURSE_LIST})
            ORDER BY 1,2
         ) q
      GROUP by user_id
      ) src
    SET #{DEST_TABLE_NAME}.professional_learning_enrolled = src.courses
    WHERE #{DEST_TABLE_NAME}.dashboard_user_id = src.user_id"
    log_completion(start)
  end

  def self.update_professional_learning_attendance
    start = Time.now
    log "Updating professional learning attendance"
    PEGASUS_REPORTING_DB_WRITER.run "
    UPDATE #{PEGASUS_DB_NAME}.#{DEST_TABLE_NAME},
      (SELECT teacher_id, GROUP_CONCAT(course) as courses FROM
        (SELECT DISTINCT teacher_id, course FROM
          (SELECT pd_attendances.teacher_id, pd_workshops.course
            FROM #{DASHBOARD_DB_NAME}.pd_attendances AS pd_attendances
              INNER JOIN #{DASHBOARD_DB_NAME}.pd_sessions AS pd_sessions ON pd_sessions.id = pd_attendances.pd_session_id
              INNER JOIN #{DASHBOARD_DB_NAME}.pd_workshops AS pd_workshops ON pd_workshops.id = pd_sessions.pd_workshop_id
            WHERE course IN (#{COURSE_LIST})
            UNION
            SELECT teacher_id,
              CASE program_type
                WHEN 1 THEN 'CS in Science'
                WHEN 2 THEN 'CS in Algebra'
                WHEN 3 THEN 'Exploring Computer Science'
                WHEN 4 THEN 'CS Principles'
                WHEN 5 THEN 'CS Fundamentals'
              END AS course
            FROM #{DASHBOARD_DB_NAME}.workshop_attendance AS workshop_attendance
              INNER JOIN #{DASHBOARD_DB_NAME}.segments AS segments ON segments.id = workshop_attendance.segment_id
              INNER JOIN #{DASHBOARD_DB_NAME}.workshops AS workshops ON workshops.id = segments.workshop_id
            ) q1
          ORDER BY 1,2
          ) q2
        GROUP BY teacher_id
      ) src
    SET #{DEST_TABLE_NAME}.professional_learning_attended = src.courses
    WHERE #{DEST_TABLE_NAME}.dashboard_user_id = src.teacher_id"
    log_completion(start)
  end

  def self.mysql_multi_connection
    # return a connection with the MULTI_STATEMENTS flag set that allows multiple statements in one DB call
    Sequel.connect(CDO.pegasus_reporting_db_writer.sub('mysql:', 'mysql2:'), flags: ::Mysql2::Client::MULTI_STATEMENTS)
  end

  def self.update_geo_data_from_forms(form_kind)
    start = Time.now
    log "Updating geo data for form kind #{form_kind}"

    record_count = 0
    num_updated = 0
    num_parse_errors = 0
    update_batch = ""
    conn = mysql_multi_connection
    time_last_output = start

    PEGASUS_REPORTING_DB_READER[:forms].where(kind: form_kind).each do |form|
      record_count += 1
      begin
        data = JSON.parse(form[:data])
      rescue JSON::ParserError
        # we have just a couple of records with invalid JSON (duplicate fields), rescue and skip these
        num_parse_errors += 1
        next
      end

      email = data['email_s'].presence
      next if email.nil?

      # Get user-supplied address/location data from form if present, from any of the differently-named location fields across all form kinds
      street_address = data['location_street_address_s'].presence || data['user_street_address_s'].presence
      city = data['location_city_s'].presence || data['user_city_s'].presence || data['teacher_city_s'].presence
      state = data['location_state_s'].presence || data['teacher_state_s'].presence
      if state.nil?
        # Note that the 'user_state_s' record is in fact a *state code*, not a state name
        state_code = data['location_state_code_s'].presence || data['state_code_s'].presence || data['user_state_s'].presence
        state = get_us_state_from_abbr(abbr: state_code, include_dc: true).presence unless state_code.nil?
      end
      postal_code = data['location_postal_code_s'].presence || data['zip_code_s'].presence || data['user_postal_code_s'].presence
      country = data['location_country_s'].presence || data['country_s'].presence || data['teacher_country_s'].presence

      # In practice, self-reported country data (often free text) from forms is garbage. The exception is a frequent reliable
      # value of exactly "united states", which is what gets filled in automatically if you enter a zip code on the petition form.
      # Trust this value if we see it, otherwise do not use country from forms; fall back to any country we got from IP geo lookup.
      country = nil unless country.presence && country.downcase == UNITED_STATES

      # Skip if this form data has no address/location info at all
      next if street_address.nil? && city.nil? && state.nil? && postal_code.nil? && country.nil?

      # Truncate all fields to 255 chars. We have some data longer than 255 chars but it is all garbage that somebody typed.
      update_data = {}
      update_data[:street_address] = street_address[0...255] unless street_address.nil?
      update_data[:city] = city[0...255] unless city.nil?
      update_data[:state] = state[0...255] unless state.nil?
      update_data[:postal_code] = postal_code[0...255] unless postal_code.nil?
      update_data[:country] = country[0...255] unless country.nil?

      # add to batch to update
      update_batch += conn[DEST_TABLE_NAME.to_sym].where(email: email).update_sql(update_data) + ";"

      num_updated += 1

      if num_updated % UPDATE_BATCH_SIZE == 0
        begin
          conn.run update_batch
        rescue => e
          log "Error: #{e}. Cmd: #{update_batch}"
          raise
        end

        # Discard the connection and get a new one after each batch. Currently, if you use multiple statements in a batch, the first call will succeed; the next call on
        # the same connection AFTER you do a multi-statement call will fail with a MySQL error that commands are out of order. The innertubes suggest that this may be a problem in mysql2 gem.
        # Fortunately, it is fairly cheap to get a new connection for each batch (time to get new connection is negligible compared to batch time).
        conn.disconnect
        conn = mysql_multi_connection

        update_batch = ""
        if Time.now - time_last_output > 5
          log "#{record_count} "
          time_last_output = Time.now
        end
      end
    end

    begin
      conn.run update_batch unless update_batch.empty?
    rescue => e
      log "Error: #{e}. Cmd: #{update_batch}"
      raise
    end
    log "- #{record_count} source records, #{num_updated} with geo data, #{num_parse_errors} skipped due to invalid JSON, #{Time.now - start} seconds"
  end

  def self.update_grades_taught
    start = Time.now
    log "Updating grades taught from dashboard.users"
    PEGASUS_REPORTING_DB_WRITER.run "
    UPDATE #{PEGASUS_DB_NAME}.#{DEST_TABLE_NAME},
    (SELECT dashboard_user_id, GROUP_CONCAT(grade) as grades FROM
      (SELECT DISTINCT #{DEST_TABLE_NAME}.dashboard_user_id, sections.grade FROM #{PEGASUS_DB_NAME}.#{DEST_TABLE_NAME}
        INNER JOIN #{DASHBOARD_DB_NAME}.sections AS sections on sections.user_id = #{DEST_TABLE_NAME}.dashboard_user_id
        WHERE #{DEST_TABLE_NAME}.dashboard_user_id is not null
        AND length(sections.grade) > 0
        ORDER by 1,2
      ) q
      GROUP BY dashboard_user_id
    ) src
    SET #{DEST_TABLE_NAME}.grades_taught = src.grades
    WHERE #{DEST_TABLE_NAME}.id > 0 AND (#{DEST_TABLE_NAME}.dashboard_user_id = src.dashboard_user_id)"
    log_completion(start)
  end

  def self.update_ages_taught_for_age(age)
    start = Time.now
    log "Updating ages taught for age #{age}"

    min_birthday_clause = ""
    max_birthday_clause = ""
    # for age = 21, include 21 and above
    min_birthday_clause = "students.birthday > DATE_ADD(NOW(), INTERVAL -#{age + 1} YEAR) AND" unless age >= 21
    # for age = 4, include 4 and below
    max_birthday_clause = "students.birthday <= DATE_ADD(NOW(), INTERVAL -#{age} YEAR) AND" unless age <= 4

    PEGASUS_REPORTING_DB_WRITER.run "
    UPDATE #{PEGASUS_DB_NAME}.#{DEST_TABLE_NAME}, (
    SELECT DISTINCT sections.user_id AS teacher_user_id
    FROM #{DASHBOARD_DB_NAME}.users AS students
      INNER JOIN #{DASHBOARD_DB_NAME}.followers AS followers
        ON followers.student_user_id = students.id
      INNER JOIN #{DASHBOARD_DB_NAME}.sections AS sections
        ON sections.id = followers.section_id
    WHERE
      -- filter by student age
      #{min_birthday_clause}
                             #{max_birthday_clause}
      -- filter out teachers who have joined section
      students.user_type = 'student'
    ) src
    SET #{DEST_TABLE_NAME}.ages_taught = CONCAT(COALESCE(CONCAT(#{DEST_TABLE_NAME}.ages_taught, ','), ''), '#{age}')
    WHERE #{DEST_TABLE_NAME}.dashboard_user_id = teacher_user_id"

    log_completion(start)
  end

  def self.update_ages_taught
    # Computing all ages taught per teacher in one massive query was computationally
    # overwhelming - the query would never complete. After experimenting with a variety
    # of approaches, the most performant solution proved to be slicing first by student
    # age (for each integer age) and calculating which teachers teach that age.
    (4..21).each do |age|
      update_ages_taught_for_age(age)
    end
  end

  def self.update_district
    start = Time.now
    log "Updating district information from users"

    # note that user district information seems less good than dashboard.pd_enrollments. So
    # far no user has had district info where dashboard.pd_enrollments did not. And user district info
    # has district names like "open csp".
    districts = District.all.index_by(&:id)

    users = User.where("length(email) > 0")

    users.find_each do |user|
      unless user.ops_school.nil?
        PEGASUS_REPORTING_DB_WRITER[DEST_TABLE_NAME.to_sym].where(email: user.email).
            update(school_name: user.ops_school)
      end

      unless user.district_id.nil?
        district = districts[user.district_id]
        unless district.nil?
          PEGASUS_REPORTING_DB_WRITER[DEST_TABLE_NAME.to_sym].where(email: user.email).update(district_name: district.name)
        end
      end
    end
    log_completion(start)

    start = Time.now
    log "Updating district information from dashboard.pd_enrollments"
    DASHBOARD_REPORTING_DB_READONLY[:pd_enrollments].exclude(email: nil).exclude(school_info_id: nil).
        select_append(:school_districts__name___district_name).select_append(:school_districts__updated_at___district_updated_at).
        inner_join(:school_infos, id: :school_info_id).
        inner_join(:school_districts, id: :school_district_id).order_by(:district_updated_at).each do |pd_enrollment|
      PEGASUS_REPORTING_DB_WRITER[DEST_TABLE_NAME.to_sym].where(email: pd_enrollment[:email]).update(
        district_name: pd_enrollment[:district_name],
        district_city: pd_enrollment[:city],
        district_state: pd_enrollment[:state],
        district_zip: pd_enrollment[:zip]
      )
    end
    log_completion(start)
  end

  def self.update_school
    start = Time.now
    log "Updating school information from dashboard.pd_enrollments"
    DASHBOARD_REPORTING_DB_READONLY[:pd_enrollments].exclude(email: nil).where('length(school) > 0').find do |pd_enrollment|
      PEGASUS_REPORTING_DB_WRITER[DEST_TABLE_NAME.to_sym].where(email: pd_enrollment[:email]).update(school_name: pd_enrollment[:school])
    end
    log_completion(start)
  end

  # helper function to get next record in SQL result set iterator
  def self.grab_next(s)
    s.next
  rescue StopIteration
    nil
  end
end
