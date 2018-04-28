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

  # Connection to read from Dashboard reporting database.
  DASHBOARD_REPORTING_DB_READER = sequel_connect(CDO.dashboard_reporting_db_reader, CDO.dashboard_reporting_db_reader)

  # Columns to disregard
  EXCLUDED_COLUMNS = %w(id pardot_id pardot_sync_at updated_at).freeze

  UPDATE_BATCH_SIZE = 100
  # interval in seconds to wait between log output for lengthy operations
  LOG_OUTPUT_INTERVAL = 5

  PEGASUS_ENV = (Rails.env.production? ? "" : "_#{Rails.env}").freeze
  PEGASUS_DB_NAME = "pegasus#{PEGASUS_ENV}".freeze
  DASHBOARD_DB_NAME = "dashboard_#{Rails.env}".freeze

  UNITED_STATES = "united states".freeze

  # Table name of table structure to copy from to create the destination working table
  TEMPLATE_TABLE_NAME = "contact_rollups".freeze
  # Table name of destination working table
  DEST_TABLE_NAME = "contact_rollups_daily".freeze

  # Set of valid PD courses. If more courses get added, need to update this list and also schema in Pardot. We
  # need to filter here to known courses in the Pardot schema - we can't blindly pass values through
  COURSE_ARRAY = [
    "CS Fundamentals",
    "CS in Algebra",
    "CS in Science",
    "CS Principles",
    "Exploring Computer Science",
    "CS Discoveries"
  ].freeze

  # PD courses in quoted, comma-separated form for inclusion in SQL IN clauses
  COURSE_LIST = COURSE_ARRAY.map {|x| "'#{x}'"}.join(',')

  CSF_SCRIPT_ARRAY = %w(
    course1
    course2
    course3
    course4
    coursea
    courseb
    coursec
    coursed
    coursee
    coursef
    20-hour
    express
    pre-express
  ).freeze

  CSF_SCRIPT_LIST = CSF_SCRIPT_ARRAY.map {|x| "'#{x}'"}.join(',')

  # Values of forms.kind field with form data we care about
  FORM_KINDS_WITH_DATA = %w(
    BringToSchool2013
    CSEdWeekEvent2013
    DistrictPartnerSubmission
    HelpUs2013
    Petition
    K5OnlineProfessionalDevelopmentPostSurvey
  ).freeze

  # Kinds of forms that indicate this contact is a teacher
  FORM_KINDS_TEACHER = %w(
    BringToSchool2013
    ClassSubmission
    DistrictPartnerSubmission
    HelpUs2013
    K5OnlineProfessionalDevelopmentPostSurvey
    K5ProfessionalDevelopmentSurvey
    ProfessionalDevelopmentWorkshop
    ProfessionalDevelopmentWorkshopSignup
  ).map {|s| "'#{s}'"}.join(',').freeze

  hoc_year = DCDO.get("hoc_year", 2017)

  # Information about presence of which forms submitted by a user get recorded in which
  # rollup field with which value
  form_infos = []
  form_infos << {kind: "'CSEdWeekEvent2013'", dest_field: "hoc_organizer_years", dest_value: "'2013'"}
  (2014..hoc_year).each do |year|
    form_infos << {kind: "'HocSignup#{year}'", dest_field: "hoc_organizer_years", dest_value: "'#{year}'"}
  end
  form_infos << {kind: "'Petition'", dest_field: "roles", dest_value: "'Petition Signer'"}
  FORM_INFOS = form_infos.freeze

  ROLE_TEACHER = "Teacher".freeze
  ROLE_FORM_SUBMITTER = "Form Submitter".freeze
  CENSUS_FORM_NAME = "Census".freeze

  def self.build_contact_rollups
    start = Time.now

    PEGASUS_REPORTING_DB_WRITER.run "SET SQL_SAFE_UPDATES = 0"
    # set READ UNCOMMITTED transaction isolation level on both read connections to avoid taking locks
    # on tables we are reading from during what can be multi-minute operations
    DASHBOARD_REPORTING_DB_READER.run "SET SESSION TRANSACTION ISOLATION LEVEL READ UNCOMMITTED"
    ActiveRecord::Base.connection.execute "SET SESSION TRANSACTION ISOLATION LEVEL READ UNCOMMITTED"
    create_destination_table
    insert_from_pegasus_forms
    insert_from_dashboard_contacts
    insert_from_dashboard_pd_enrollments
    insert_from_dashboard_census_submissions
    update_geo_from_school_data
    update_unsubscribe_info
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

    # parse all forms that collect user-reported address/location or other data of interest
    FORM_KINDS_WITH_DATA.each do |kind|
      update_data_from_forms(kind)
    end

    # Add contacts to the Teacher role based on form responses
    update_teachers_from_forms
    update_teachers_from_census_submissions

    count = PEGASUS_REPORTING_DB_READER["select count(*) as cnt from #{PEGASUS_DB_NAME}.#{DEST_TABLE_NAME}"].first[:cnt]
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
    time_last_output = Time.now
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

      num_total = num_inserts + num_updates + num_unchanged
      if Time.now - time_last_output > LOG_OUTPUT_INTERVAL
        log "Total source rows processed: #{num_total}"
        time_last_output = Time.now
      end

      # Go on to the next source record
      contact_rollup_src = grab_next(src_iterator)
    end

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
    # puts s unless Rails.env.test?
    CDO.log.info s
  end

  def self.log_completion(start)
    log "   Completed in #{Time.now - start} seconds"
  end

  def self.insert_from_dashboard_contacts
    start = Time.now
    log "Inserting teacher contacts and IP geo data from dashboard.users"
    # MULTIAUTH edit point
    PEGASUS_REPORTING_DB_WRITER.run "
    INSERT INTO #{PEGASUS_DB_NAME}.#{DEST_TABLE_NAME} (email, name, dashboard_user_id, roles, city, state, postal_code, country)
    -- Use CONCAT+COALESCE to append 'Teacher' to any existing roles
    SELECT users.email COLLATE utf8_general_ci, users.name, users.id, CONCAT(COALESCE(CONCAT(src.roles, ','), ''), '#{ROLE_TEACHER}'),
    user_geos.city, user_geos.state, user_geos.postal_code, user_geos.country FROM #{DASHBOARD_DB_NAME}.users_view AS users
    LEFT OUTER JOIN #{PEGASUS_DB_NAME}.contact_rollups_daily AS src ON src.email = users.email
    LEFT OUTER JOIN #{DASHBOARD_DB_NAME}.user_geos AS user_geos ON user_geos.user_id = users.id
    WHERE users.user_type = 'teacher' AND LENGTH(users.email) > 0
    ON DUPLICATE KEY UPDATE #{DEST_TABLE_NAME}.name = VALUES(name), #{DEST_TABLE_NAME}.dashboard_user_id = VALUES(dashboard_user_id),
    #{DEST_TABLE_NAME}.roles = VALUES(roles)"
    log_completion(start)
  end

  def self.insert_from_dashboard_pd_enrollments
    start = Time.now
    log "Inserting contacts from dashboard.pd_enrollments"
    PEGASUS_REPORTING_DB_WRITER.run "
    INSERT INTO #{PEGASUS_DB_NAME}.#{DEST_TABLE_NAME} (email, name, roles)
    SELECT email, name, '#{ROLE_TEACHER}'
    FROM #{DASHBOARD_DB_NAME}.pd_enrollments AS pd_enrollments
    WHERE LENGTH(pd_enrollments.email) > 0
    ON DUPLICATE KEY UPDATE name = #{DEST_TABLE_NAME}.name,
    -- Use LOCATE to determine if this role is already present and CONCAT+COALESCE to add it if it is not.
    roles =
    CASE LOCATE(values(roles), COALESCE(#{DEST_TABLE_NAME}.roles,''))
      WHEN 0 THEN LEFT(CONCAT(COALESCE(CONCAT(#{DEST_TABLE_NAME}.roles, ','), ''),values(roles)),255)
      ELSE #{DEST_TABLE_NAME}.roles
    END"

    log_completion(start)
  end

  def self.insert_from_dashboard_census_submissions
    start = Time.now
    log "Inserting contacts from dashboard.census_submissions"
    PEGASUS_REPORTING_DB_WRITER.run "
    INSERT INTO #{PEGASUS_DB_NAME}.#{DEST_TABLE_NAME} (email, name, roles, forms_submitted, form_roles)
    SELECT submitter_email_address, submitter_name, '#{ROLE_FORM_SUBMITTER}', '#{CENSUS_FORM_NAME}', lower(submitter_role)
    FROM #{DASHBOARD_DB_NAME}.census_submissions AS census_submissions
    WHERE LENGTH(census_submissions.submitter_email_address) > 0
    ON DUPLICATE KEY
    UPDATE #{DEST_TABLE_NAME}.forms_submitted =
    CASE LOCATE(values(forms_submitted), COALESCE(#{DEST_TABLE_NAME}.forms_submitted,''))
      WHEN 0 THEN LEFT(CONCAT(COALESCE(CONCAT(#{DEST_TABLE_NAME}.forms_submitted, ','), ''),values(forms_submitted)),255)
      ELSE #{DEST_TABLE_NAME}.forms_submitted
    END,
    roles =
    CASE LOCATE(values(roles), COALESCE(#{DEST_TABLE_NAME}.roles,''))
      WHEN 0 THEN LEFT(CONCAT(COALESCE(CONCAT(#{DEST_TABLE_NAME}.roles, ','), ''),values(roles)),255)
      ELSE #{DEST_TABLE_NAME}.roles
    END,
    form_roles =
     CASE LOCATE(values(form_roles), COALESCE(#{DEST_TABLE_NAME}.form_roles,''))
      WHEN 0 THEN LEFT(CONCAT(COALESCE(CONCAT(#{DEST_TABLE_NAME}.form_roles, ','), ''),values(form_roles)),255)
      ELSE #{DEST_TABLE_NAME}.form_roles
    END"

    log_completion(start)
  end

  def self.update_geo_from_school_data
    start = Time.now
    log "Updating user geo data from school data"

    # State for schools is stored in state abbreviation. We need to convert
    # to state name, so do this row-by-row using existing Ruby code for that
    # conversion.
    # MULTIAUTH edit point
    sql = "
    SELECT users.email, schools.city, schools.state, schools.zip
    FROM users_view
    INNER JOIN school_infos ON school_infos.id = users.school_info_id
    INNER JOIN schools ON schools.id = school_infos.school_id"

    dataset = DASHBOARD_REPORTING_DB_READER[sql]

    dataset.each do |user_and_geo|
      state_code = user_and_geo[:state]
      # convert from state code to state name
      state = get_us_state_from_abbr(state_code, true)
      next unless state.presence
      city = user_and_geo[:city]
      zip = user_and_geo[:zip]
      email = user_and_geo[:email]
      # update the user's city/state/zip
      PEGASUS_REPORTING_DB_WRITER[DEST_TABLE_NAME.to_sym].where(email: email).
        update(city: city, state: state,
        postal_code: zip, country: 'United States'
        )
    end

    log_completion(start)
  end

  def self.update_teachers_from_forms
    start = Time.now
    log "Updating teacher roles based on submitted forms"
    PEGASUS_REPORTING_DB_WRITER.run "
    UPDATE #{PEGASUS_DB_NAME}.#{DEST_TABLE_NAME}
    INNER JOIN #{PEGASUS_DB_NAME}.forms on forms.email = #{DEST_TABLE_NAME}.email
    SET roles =
    -- Use LOCATE to determine if this role is already present and CONCAT+COALESCE to add it if it is not.
    CASE LOCATE('#{ROLE_TEACHER}', COALESCE(#{DEST_TABLE_NAME}.roles,''))
      WHEN 0 THEN LEFT(CONCAT(COALESCE(CONCAT(#{DEST_TABLE_NAME}.roles, ','), ''),'#{ROLE_TEACHER}'),255)
      ELSE #{DEST_TABLE_NAME}.roles
    END
    WHERE forms.kind in (#{FORM_KINDS_TEACHER})
    OR #{DEST_TABLE_NAME}.form_roles like '%educator%'"

    log_completion(start)
  end

  def self.update_teachers_from_census_submissions
    start = Time.now
    log "Updating teacher roles based on census submissions"
    PEGASUS_REPORTING_DB_WRITER.run "
    UPDATE #{PEGASUS_DB_NAME}.#{DEST_TABLE_NAME}
    INNER JOIN #{DASHBOARD_DB_NAME}.census_submissions on census_submissions.submitter_email_address = #{DEST_TABLE_NAME}.email
    SET roles =
    -- Use LOCATE to determine if this role is already present and CONCAT+COALESCE to add it if it is not.
    CASE LOCATE('#{ROLE_TEACHER}', COALESCE(#{DEST_TABLE_NAME}.roles,''))
      WHEN 0 THEN LEFT(CONCAT(COALESCE(CONCAT(#{DEST_TABLE_NAME}.roles, ','), ''),'#{ROLE_TEACHER}'),255)
      ELSE #{DEST_TABLE_NAME}.roles
    END
    WHERE census_submissions.submitter_role = 'TEACHER'"

    log_completion(start)
  end

  def self.update_unsubscribe_info
    start = Time.now
    log "Inserting contacts from pegasus.contacts"
    PEGASUS_REPORTING_DB_WRITER.run "
    UPDATE #{PEGASUS_DB_NAME}.#{DEST_TABLE_NAME}
    INNER JOIN #{PEGASUS_DB_NAME}.contacts on contacts.email = #{DEST_TABLE_NAME}.email
    SET opted_out = true
    WHERE unsubscribed_at IS NOT NULL"
    log_completion(start)
  end

  def self.insert_from_pegasus_forms
    start = Time.now
    log "Inserting contacts and IP geo data from pegasus.forms"
    PEGASUS_REPORTING_DB_WRITER.run "
    INSERT INTO #{PEGASUS_DB_NAME}.#{DEST_TABLE_NAME} (email, name, roles, forms_submitted, city, state, postal_code, country)
    SELECT email, name, '#{ROLE_FORM_SUBMITTER}', kind, city, state, postal_code, country FROM #{PEGASUS_DB_NAME}.forms
    LEFT OUTER JOIN #{PEGASUS_DB_NAME}.form_geos on form_geos.form_id = forms.id
    ON DUPLICATE KEY UPDATE
    -- Update forms_submitted with the list of all forms submitted by this email address
    #{DEST_TABLE_NAME}.forms_submitted =
    -- Add the form kind for this form to the list for this email address if it is not already present for this email.
    -- Use LOCATE to determine if this form kind is already present and CONCAT+COALESCE to add it if it is not.
    CASE LOCATE(VALUES(forms_submitted), COALESCE(#{DEST_TABLE_NAME}.forms_submitted,''))
      WHEN 0 THEN LEFT(CONCAT(COALESCE(CONCAT(#{DEST_TABLE_NAME}.forms_submitted, ','), ''), VALUES(forms_submitted)),4096)
      ELSE #{DEST_TABLE_NAME}.forms_submitted
    END"
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
    log "Updating Regional Partner role"
    append_regional_partner_to_role_list
    log_completion(start)

    start = Time.now
    log "Updating CSF/CSD/CSP teacher roles"
    # CSF scripts don't have a course mapping - identify CSF teachers by
    # specific scripts
    add_role_from_script_sections_taught("CSF Teacher", CSF_SCRIPT_LIST)
    # CSD and CSP scripts are mapped to course - identify CSD/CSP teachers
    # that way
    add_role_from_course_sections_taught("CSD Teacher", "csd")
    add_role_from_course_sections_taught("CSP Teacher", "csp")
    log_completion(start)
  end

  def self.append_to_role_list_from_permission(permission_name, dest_value)
    # MULTIAUTH edit point
    PEGASUS_REPORTING_DB_WRITER.run "
    UPDATE #{PEGASUS_DB_NAME}.#{DEST_TABLE_NAME}
    INNER JOIN #{DASHBOARD_DB_NAME}.users_view AS users ON users.id = #{PEGASUS_DB_NAME}.#{DEST_TABLE_NAME}.dashboard_user_id
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

  def self.add_role_from_course_sections_taught(role_name, course_name)
    # MULTIAUTH edit point
    PEGASUS_REPORTING_DB_WRITER.run "
    UPDATE #{PEGASUS_DB_NAME}.#{DEST_TABLE_NAME}
    INNER JOIN (
      select distinct id from (
        select users.id from #{DASHBOARD_DB_NAME}.sections as sections
          inner join #{DASHBOARD_DB_NAME}.courses as courses on courses.id = sections.course_id
            inner join #{DASHBOARD_DB_NAME}.users_view as users on users.id = sections.user_id
         where courses.name = '#{course_name}'
        union
        select users.id from #{DASHBOARD_DB_NAME}.sections
          inner join #{DASHBOARD_DB_NAME}.scripts as scripts on scripts.id = sections.script_id
          inner join #{DASHBOARD_DB_NAME}.course_scripts as course_scripts on course_scripts.script_id = scripts.id
          inner join #{DASHBOARD_DB_NAME}.courses as courses on courses.id = course_scripts.course_id
          inner join #{DASHBOARD_DB_NAME}.users_view as users on users.id = sections.user_id
        where courses.name = '#{course_name}'
      ) q
    ) user_ids ON user_ids.id = #{PEGASUS_DB_NAME}.#{DEST_TABLE_NAME}.dashboard_user_id
    SET roles = CONCAT(COALESCE(CONCAT(roles, ','), ''), '#{role_name}')
    WHERE #{DEST_TABLE_NAME}.id > 0"
  end

  def self.add_role_from_script_sections_taught(role_name, script_list)
    PEGASUS_REPORTING_DB_WRITER.run "
    UPDATE #{PEGASUS_DB_NAME}.#{DEST_TABLE_NAME}
    INNER JOIN (
        select distinct sections.user_id from #{DASHBOARD_DB_NAME}.sections AS sections
          INNER JOIN #{DASHBOARD_DB_NAME}.scripts as scripts on scripts.id = sections.script_id
        where scripts.name IN (#{script_list})
    ) user_ids ON user_ids.user_id = #{PEGASUS_DB_NAME}.#{DEST_TABLE_NAME}.dashboard_user_id
    SET roles = CONCAT(COALESCE(CONCAT(roles, ','), ''), '#{role_name}')
    WHERE #{DEST_TABLE_NAME}.id > 0"
  end

  def self.append_regional_partner_to_role_list
    # MULTIAUTH edit point
    PEGASUS_REPORTING_DB_WRITER.run "
    UPDATE #{PEGASUS_DB_NAME}.#{DEST_TABLE_NAME}
    INNER JOIN #{DASHBOARD_DB_NAME}.users_view AS users ON users.id = #{PEGASUS_DB_NAME}.#{DEST_TABLE_NAME}.dashboard_user_id
    INNER JOIN #{DASHBOARD_DB_NAME}.regional_partners AS regional_partners ON regional_partners.contact_id = users.id
    SET roles = CONCAT(COALESCE(CONCAT(roles, ','), ''), 'Regional Partner')
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

    COURSE_ARRAY.each do |course|
      # Update enrollments linked by user id
      update_professional_learning_enrollment_for_course_from_userid course
      # Update enrollments linked by email
      update_professional_learning_enrollment_for_course_from_email course
    end

    log_completion(start)
  end

  # Updates user id-based professional learning enrollment for specified course
  # @param course [String] name of course to update for
  def self.update_professional_learning_enrollment_for_course_from_userid(course)
    PEGASUS_REPORTING_DB_WRITER.run "
    UPDATE #{PEGASUS_DB_NAME}.#{DEST_TABLE_NAME},
      (SELECT user_id FROM
        (SELECT DISTINCT pd_enrollments.user_id FROM #{DASHBOARD_DB_NAME}.pd_enrollments AS pd_enrollments
          INNER JOIN #{DASHBOARD_DB_NAME}.pd_workshops AS pd_workshops ON pd_workshops.id = pd_enrollments.pd_workshop_id
          WHERE course = '#{course}'
        ) q
      ) src
    SET #{DEST_TABLE_NAME}.professional_learning_enrolled =
      -- Use LOCATE to determine if this role is already present and CONCAT+COALESCE to add it if it is not.
      CASE LOCATE('#{course}', COALESCE(#{DEST_TABLE_NAME}.professional_learning_enrolled,''))
        WHEN 0 THEN LEFT(CONCAT(COALESCE(CONCAT(#{DEST_TABLE_NAME}.professional_learning_enrolled, ','), ''), '#{course}'),4096)
        ELSE #{DEST_TABLE_NAME}.professional_learning_enrolled
      END
    WHERE #{DEST_TABLE_NAME}.dashboard_user_id = src.user_id"
  end

  # Updates email-based professional learning enrollment for specified course
  # @param course [String] name of course to update for
  def self.update_professional_learning_enrollment_for_course_from_email(course)
    PEGASUS_REPORTING_DB_WRITER.run "
    UPDATE #{PEGASUS_DB_NAME}.#{DEST_TABLE_NAME},
      (SELECT email FROM
        (SELECT DISTINCT pd_enrollments.email FROM #{DASHBOARD_DB_NAME}.pd_enrollments AS pd_enrollments
          INNER JOIN #{DASHBOARD_DB_NAME}.pd_workshops AS pd_workshops ON pd_workshops.id = pd_enrollments.pd_workshop_id
          WHERE course = '#{course}'
        ) q
      ) src
    SET #{DEST_TABLE_NAME}.professional_learning_enrolled =
      -- Use LOCATE to determine if this role is already present and CONCAT+COALESCE to add it if it is not.
      CASE LOCATE('#{course}', COALESCE(#{DEST_TABLE_NAME}.professional_learning_enrolled,''))
        WHEN 0 THEN LEFT(CONCAT(COALESCE(CONCAT(#{DEST_TABLE_NAME}.professional_learning_enrolled, ','), ''), '#{course}'),4096)
        ELSE #{DEST_TABLE_NAME}.professional_learning_enrolled
      END
    WHERE #{DEST_TABLE_NAME}.email = src.email"
  end

  def self.update_professional_learning_attendance
    start = Time.now
    COURSE_ARRAY.each do |course|
      update_professional_learning_attendance_for_course_from_pd_attendances course
      update_professional_learning_attendance_for_course_from_workshop_attendance course
      update_professional_learning_attendance_for_course_from_sections course
    end
    log_completion(start)
  end

  # Updates professional learning attendance based on pd_attendances table
  # @param course [String] name of course to update for
  def self.update_professional_learning_attendance_for_course_from_pd_attendances(course)
    # MULTIAUTH edit point
    PEGASUS_REPORTING_DB_WRITER.run "
      UPDATE #{PEGASUS_DB_NAME}.#{DEST_TABLE_NAME},
        (SELECT DISTINCT users.email
          FROM #{DASHBOARD_DB_NAME}.pd_attendances AS pd_attendances
          INNER JOIN #{DASHBOARD_DB_NAME}.pd_sessions AS pd_sessions ON pd_sessions.id = pd_attendances.pd_session_id
          INNER JOIN #{DASHBOARD_DB_NAME}.pd_workshops AS pd_workshops ON pd_workshops.id = pd_sessions.pd_workshop_id
          INNER JOIN #{DASHBOARD_DB_NAME}.users_view AS users ON users.id = pd_attendances.teacher_id
          WHERE course = '#{course}'
        ) src
      SET #{DEST_TABLE_NAME}.professional_learning_attended =
      -- Use LOCATE to determine if this role is already present and CONCAT+COALESCE to add it if it is not.
      CASE LOCATE('#{course}', COALESCE(#{DEST_TABLE_NAME}.professional_learning_attended,''))
        WHEN 0 THEN LEFT(CONCAT(COALESCE(CONCAT(#{DEST_TABLE_NAME}.professional_learning_attended, ','), ''), '#{course}'),4096)
        ELSE #{DEST_TABLE_NAME}.professional_learning_attended
      END
    WHERE #{DEST_TABLE_NAME}.email = src.email"
  end

  # Updates professional learning attendance based on workshop_attendance table
  # @param course [String] name of course to update for
  def self.update_professional_learning_attendance_for_course_from_workshop_attendance(course)
    # MULTIAUTH edit point
    PEGASUS_REPORTING_DB_WRITER.run "
    UPDATE #{PEGASUS_DB_NAME}.#{DEST_TABLE_NAME},
      (SELECT DISTINCT users.email
        FROM #{DASHBOARD_DB_NAME}.workshop_attendance AS workshop_attendance
          INNER JOIN #{DASHBOARD_DB_NAME}.segments AS segments ON segments.id = workshop_attendance.segment_id
          INNER JOIN #{DASHBOARD_DB_NAME}.workshops AS workshops ON workshops.id = segments.workshop_id
          INNER JOIN #{DASHBOARD_DB_NAME}.users_view AS users ON users.id = workshop_attendance.teacher_id
        WHERE program_type =
        CASE '#{course}'
          WHEN 'CS in Science' THEN 1
          WHEN 'CS in Algebra' THEN 2
          WHEN 'Exploring Computer Science' THEN 3
          WHEN 'CS Principles' THEN 4
          WHEN 'CS Fundamentals' THEN 5
        END
      ) src
    SET #{DEST_TABLE_NAME}.professional_learning_attended =
    -- Use LOCATE to determine if this role is already present and CONCAT+COALESCE to add it if it is not.
    CASE LOCATE('#{course}', COALESCE(#{DEST_TABLE_NAME}.professional_learning_attended,''))
      WHEN 0 THEN LEFT(CONCAT(COALESCE(CONCAT(#{DEST_TABLE_NAME}.professional_learning_attended, ','), ''), '#{course}'),4096)
      ELSE #{DEST_TABLE_NAME}.professional_learning_attended
    END
    WHERE #{DEST_TABLE_NAME}.email = src.email"
  end

  # Updates professional learning attendance based on sections table
  # @param course [String] name of course to update for
  def self.update_professional_learning_attendance_for_course_from_sections(course)
    # MULTIAUTH edit point
    PEGASUS_REPORTING_DB_WRITER.run "
    UPDATE #{PEGASUS_DB_NAME}.#{DEST_TABLE_NAME},
      (SELECT DISTINCT users.email
      FROM #{DASHBOARD_DB_NAME}.sections
        INNER JOIN #{DASHBOARD_DB_NAME}.followers ON followers.section_id = sections.id
        INNER JOIN #{DASHBOARD_DB_NAME}.users_view ON users.id = followers.student_user_id
      WHERE section_type =
      CASE '#{course}'
        WHEN 'CS in Science' THEN 'csins_workshop'
        WHEN 'CS in Algebra' THEN 'csina_workshop'
        WHEN 'Exploring Computer Science' THEN 'ecs_workshop'
        WHEN 'CS Principles' THEN 'csp_workshop'
        WHEN 'CS Fundamentals' THEN 'csf_workshop'
      END) src
    SET #{DEST_TABLE_NAME}.professional_learning_attended =
    -- Use LOCATE to determine if this role is already present and CONCAT+COALESCE to add it if it is not.
    CASE LOCATE('#{course}', COALESCE(#{DEST_TABLE_NAME}.professional_learning_attended,''))
      WHEN 0 THEN LEFT(CONCAT(COALESCE(CONCAT(#{DEST_TABLE_NAME}.professional_learning_attended, ','), ''), '#{course}'),4096)
      ELSE #{DEST_TABLE_NAME}.professional_learning_attended
    END
    WHERE #{DEST_TABLE_NAME}.email = src.email"
  end

  def self.mysql_multi_connection
    # return a connection with the MULTI_STATEMENTS flag set that allows multiple statements in one DB call
    Sequel.connect(CDO.pegasus_reporting_db_writer.sub('mysql:', 'mysql2:'), flags: ::Mysql2::Client::MULTI_STATEMENTS)
  end

  # Extracts and formats address data from form data
  # @param form_data [Hash] data from a form
  # @return [Hash] hash of extracted address data. Note it may be empty if no address fields were found.
  #   Possible hash keys: [:street_address, :city, :state, :postal_code, :country]
  def self.get_address_data_from_form_data(form_data)
    {}.tap do |address_data|
      # Get user-supplied address/location data from form if present, from any of the differently-named location fields across all form kinds
      street_address = form_data['location_street_address_s'].presence || form_data['user_street_address_s'].presence
      city = form_data['location_city_s'].presence || form_data['user_city_s'].presence || form_data['teacher_city_s'].presence
      state = form_data['location_state_s'].presence || form_data['teacher_state_s'].presence
      if state.nil?
        # Note that the 'user_state_s' record is in fact a *state code*, not a state name
        state_code = form_data['location_state_code_s'].presence || form_data['state_code_s'].presence || form_data['user_state_s'].presence
        state = get_us_state_from_abbr(state_code, true).presence unless state_code.nil?
      end
      postal_code = form_data['location_postal_code_s'].presence || form_data['zip_code_s'].presence || form_data['user_postal_code_s'].presence
      country = form_data['location_country_s'].presence || form_data['country_s'].presence || form_data['teacher_country_s'].presence

      # In practice, self-reported country data (often free text) from forms is garbage. The exception is a frequent reliable
      # value of "united states", which is what gets filled in automatically if you enter a zip code on the petition form.
      # Trust this value if we see it, otherwise do not use country from forms; fall back to any country we got from IP geo lookup.
      country = nil unless country.presence && country.downcase == UNITED_STATES

      # If any geo input is present in form, update ALL geo fields including setting NULL values in DB for any that
      # we don't have from this form. This will clear out any previous geo data from IP geo.
      # Truncate all fields to 255 chars. We have some data longer than 255 chars but it is all garbage that somebody typed
      address_data[:street_address] = truncate_or_nil(street_address)
      address_data[:city] = truncate_or_nil(city)
      address_data[:state] = truncate_or_nil(state)
      address_data[:postal_code] = truncate_or_nil(postal_code)
      address_data[:country] = truncate_or_nil(country)
    end
  end

  # returns left most 255 characters of string if non-nil, otherwise nil
  def self.truncate_or_nil(value)
    value.present? ? value[0...255] : nil
  end

  # Gets the update sql command for address data from a form's data
  # @param form_data [Hash] form data
  # @param email [String] email associated with this form
  # @return [String, nil] sql update command for this form's address data, or nil
  def self.get_address_update_from_form_data(conn, form_data, email)
    address_data = get_address_data_from_form_data form_data

    return nil if address_data.empty?
    conn[DEST_TABLE_NAME.to_sym].where(email: email).update_sql(address_data) + ';'
  end

  # Gets the update sql command for role
  # @param role [String, nil] form role, or empty / nil if there is no role
  # @param email [String] email associated with this form
  # @return [String, nil] sql update command for this form role and email, or nil if there is no role.
  def self.get_role_update_from_form_role(role, email)
    return nil unless role.present?

    # If role (role_s field) was a field on this form, append it to a comma-separate list of roles
    # that have been submitted on forms for this email
    "
      UPDATE #{PEGASUS_DB_NAME}.#{DEST_TABLE_NAME}
      INNER JOIN #{PEGASUS_DB_NAME}.#{DEST_TABLE_NAME} AS src ON src.email = #{DEST_TABLE_NAME}.email
      SET #{DEST_TABLE_NAME}.form_roles =
      -- Use LOCATE to determine if this role is already present and CONCAT+COALESCE to add it if it is not.
      CASE LOCATE('#{role}', COALESCE(src.form_roles,''))
        WHEN 0 THEN LEFT(CONCAT(COALESCE(CONCAT(src.form_roles, ','), ''), '#{role}'),4096)
        ELSE src.form_roles
      END
      WHERE #{DEST_TABLE_NAME}.email = '#{email}';
    "
  end

  # Updates data based on all forms of a given kind, in batches
  # @param form_kind [Symbol] form kind
  def self.update_data_from_forms(form_kind)
    start = Time.now
    log "Updating data for form kind #{form_kind}"

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

      form_updates = ""

      address_update = get_address_update_from_form_data conn, data, email
      role_update = get_role_update_from_form_role data['role_s'], email
      form_updates += address_update if address_update
      form_updates += role_update if role_update

      next if form_updates.empty?
      update_batch += form_updates

      num_updated += 1

      next unless num_updated % UPDATE_BATCH_SIZE == 0
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
      if Time.now - time_last_output > LOG_OUTPUT_INTERVAL
        log "Total records processed: #{record_count}"
        time_last_output = Time.now
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
    # MULTIAUTH note: this doesn't actually access dashboard.users
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

    # MULTIAUTH edit point
    PEGASUS_REPORTING_DB_WRITER.run "
    UPDATE #{PEGASUS_DB_NAME}.#{DEST_TABLE_NAME}, (
    SELECT DISTINCT sections.user_id AS teacher_user_id
    FROM #{DASHBOARD_DB_NAME}.users_view AS students
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

    # MULTIAUTH edit point
    # users = User.where("length(email) > 0") # original query, replaced by following
    users = User.find_by_sql(<<-eos
      SELECT * FROM users
      LEFT JOIN authentication_options
        ON users.primary_authentication_option_id = authentication_options.id
      WHERE
        IF (
          users.provider = 'migrated',
          length(authentication_options.email),
          length(users.email)
        )
        > 0
    eos
    )

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
    DASHBOARD_REPORTING_DB_READER[:pd_enrollments].exclude(email: nil).exclude(school_info_id: nil).
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
    DASHBOARD_REPORTING_DB_READER[:pd_enrollments].exclude(email: nil).where('length(school) > 0').find do |pd_enrollment|
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
