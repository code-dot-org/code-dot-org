require File.expand_path('../../../pegasus/src/env', __FILE__)

class ContactRollupsValidation
  # Connection to read from Pegasus reporting database.
  PEGASUS_REPORTING_DB_READER = sequel_connect(CDO.pegasus_reporting_db_reader, CDO.pegasus_reporting_db_reader)

  DATA_CHECKS = [
    {
      name: "Rollup total record count",
      query: "SELECT COUNT(*) FROM contact_rollups_daily",
      min: 3_000_000,
      max: 4_000_000
    },
    {
      name: "Contacts with no role",
      query: "SELECT COUNT(*) FROM contact_rollups_daily WHERE roles
              IS NULL",
      min: 0,
      max: 0
    },
    {
      name: "Teacher count",
      query: "SELECT COUNT(*) from contact_rollups_daily WHERE roles
              LIKE '%Teacher%'",
      min: 520_000,
      max: 2_000_000
    },
    {
      name: "CSF Teacher count",
      query: "SELECT COUNT(*) from contact_rollups_daily WHERE roles
              LIKE '%CSF Teacher%'",
      min: 50_000,
      max: 500_000
    },
    {
      name: "CSD Teacher count",
      query: "SELECT COUNT(*) from contact_rollups_daily WHERE roles
              LIKE '%CSD Teacher%'",
      min: 1_000,
      max: 50_000
    },
    {
      name: "CSP Teacher count",
      query: "SELECT COUNT(*) from contact_rollups_daily WHERE roles
              LIKE '%CSP Teacher%'",
      min: 5_000,
      max: 100_000
    },
    {
      name: "Facilitator count",
      query: "SELECT COUNT(*) from contact_rollups_daily WHERE roles
              LIKE '%Facilitator%'",
      min: 400,
      max: 4_000
    },
    {
      name: "District Contact count",
      query: "SELECT COUNT(*) from contact_rollups_daily WHERE roles
              LIKE '%District Contact%'",
      min: 50,
      max: 500
    },
    {
      name: "Petition Signer count",
      query: "SELECT COUNT(*) from contact_rollups_daily WHERE roles
              LIKE '%Petition Signer%'",
      min: 1_750_000,
      max: 5_000_000
    },
    {
      name: "Form Submitter count",
      query: "SELECT COUNT(*) from contact_rollups_daily WHERE roles
              LIKE '%Form Submitter%'",
      min: 2_500_000,
      max: 10_000_000
    },
    {
      # Check that rollup's 'opt_out' data matches pegasus.contact's
      # 'unsubscribed_at' data. In general the
      # discrepancy should be 0 records. Allow for a handful of mismatches
      # since production data may have changed slightly.
      name: "Count of email addresses in rollup not marked as 'opted_out'"\
            " that have 'unsubscribed_at' set in contacts",
      query: "SELECT COUNT(*) FROM contact_rollups_daily
              INNER JOIN contacts on contacts.email =
              contact_rollups_daily.email
              WHERE contacts.unsubscribed_at IS NOT NULL
              AND contact_rollups_daily.opted_out <> 1",
      min: 0,
      max: 100
    },
    {
      # max expected # of distinct state values is 50 states + null +
      # 3 versions of "DC" =  54
      name: "US state count",
      query: "SELECT COUNT(distinct state) FROM contact_rollups_daily
              WHERE country = 'united states'",
      min: 50,
      max: 54
    },
    {
      name: "Country count",
      query: "SELECT COUNT(distinct country) FROM contact_rollups_daily",
      min: 200,
      max: 250
    },
    {
      name: "Count of contacts with non-empty names",
      query: "SELECT COUNT(*) FROM contact_rollups_daily
              WHERE name IS NOT NULL",
      min: 3_000_000,
      max: 10_000_000
    },
    {
      name: "Count of contacts with NULL or empty names",
      query: "SELECT COUNT(*) FROM contact_rollups_daily
              WHERE name IS NULL OR LENGTH(name)=0",
      min: 0,
      max: 100_000
    },
    {
      name: "Count of contacts with non-NULL country",
      query: "SELECT COUNT(*) FROM contact_rollups_daily
              WHERE country IS NOT NULL",
      min: 1_900_000,
      max: 10_000_000
    },
    {
      name: "Count of contacts with non-NULL state",
      query: "SELECT COUNT(*) FROM contact_rollups_daily
              WHERE state IS NOT NULL",
      min: 1_700_000,
      max: 10_000_000
    },
    {
      name: "Count of contacts with non-NULL city",
      query: "SELECT COUNT(*) FROM contact_rollups_daily
              WHERE city IS NOT NULL",
      min: 1_000_000,
      max: 10_000_000
    },
    {
      name: "Distinct district name count",
      query: "SELECT COUNT(distinct district_name)
              FROM contact_rollups_daily",
      min: 2_000,
      max: 10_000
    },
    {
      name: "Distinct district state count",
      query: "SELECT COUNT(distinct district_state)
              FROM contact_rollups_daily",
      min: 48,
      max: 54
    },
    {
      name: "Distinct school name count",
      query: "SELECT COUNT(distinct school_name)
              FROM contact_rollups_daily",
      min: 3000,
      max: 30_000
    },
    {
      name: "Count of contacts with courses facilitated",
      query: "SELECT COUNT(*) FROM contact_rollups_daily
              WHERE courses_facilitated IS NOT NULL",
      min: 100,
      max: 40_000
    },
    {
      name: "Count of contacts with professional learning enrollment",
      query:  "SELECT COUNT(*) FROM contact_rollups_daily
              WHERE professional_learning_enrolled IS NOT NULL",
      min: 13_000,
      max: 100_000
    },
    {
      name: "Count of contacts with professional learning attended",
      query:  "SELECT COUNT(*) FROM contact_rollups_daily
              WHERE professional_learning_attended IS NOT NULL",
      min: 13_000,
      max: 100_000
    },
    {
      name: "Count of contacts with HOC organizer years",
      query:  "SELECT COUNT(*) FROM contact_rollups_daily
              WHERE hoc_organizer_years IS NOT NULL",
      min: 375_000,
      max: 750_000
    },
    {
      name: "Count of contacts with grades taught",
      query:  "SELECT COUNT(*) FROM contact_rollups_daily
              WHERE grades_taught IS NOT NULL",
      min: 200_000,
      max: 800_000
    },
    {
      name: "Check that all contacts with grades taught are "\
            "teachers",
      query: "SELECT COUNT(*) FROM contact_rollups_daily
              WHERE grades_taught IS NOT NULL
              AND Roles NOT LIKE '%Teacher%'",
      min: 0,
      max: 0
    },
    {
      name: "Count of contacts with ages taught",
      query:  "SELECT COUNT(*) FROM contact_rollups_daily
              WHERE ages_taught IS NOT NULL",
      min: 190_000,
      max: 600_000
    },
    {
      name: "Check that all contacts with ages taught are "\
            "teachers",
      query: "SELECT COUNT(*) FROM contact_rollups_daily
              WHERE ages_taught IS NOT NULL
              AND Roles NOT LIKE '%Teacher%'",
      min: 0,
      max: 0
    },
    {
      name: "Count of contacts with forms submitted",
      query:  "SELECT COUNT(*) FROM contact_rollups_daily
              WHERE forms_submitted IS NOT NULL",
      min: 2_600_000,
      max: 5_000_000
    },
    {
      name: "Check that all contacts with forms submitted are "\
            "form submitters",
      query: "SELECT COUNT(*) FROM contact_rollups_daily
              WHERE forms_submitted IS NOT NULL
              AND Roles NOT LIKE '%Form Submitter%'",
      min: 0,
      max: 0
    },
    {
      name: "Count of contacts with form roles",
      query:  "SELECT COUNT(*) FROM contact_rollups_daily
              WHERE form_roles IS NOT NULL",
      min: 1_750_000,
      max: 3_500_000
    },
    {
      name: "Check that all contacts with form roles are "\
            "form submitters",
      query: "SELECT COUNT(*) FROM contact_rollups_daily
              WHERE form_roles IS NOT NULL
              AND Roles NOT LIKE '%Form Submitter%'",
      min: 0,
      # Sometimes validation fails with one contact (out of millions) failing
      # the check. Running the same query later on same data yields expected
      # 0 count. Possibly related to reading back immediately after big write?
      # For the moment relax validation slightly to allow a single record to
      # fail validation.
      max: 1
    },
    {
      # Double-check consistency of the complex (but necessary) query
      # to mark contacts in the Teacher role
      name: "Check that all contacts that match 'Teacher Query' "\
            "are in Teacher role",
      query: "SELECT COUNT(*) from contact_rollups_daily
              WHERE (dashboard_user_id is not null
              OR forms_submitted LIKE '%BringToSchool2013%'
              OR forms_submitted LIKE '%ClassSubmission%'
              OR forms_submitted LIKE '%DistrictPartnerSubmission%'
              OR forms_submitted LIKE '%HelpUs2013%'
              OR forms_submitted LIKE '%K5OnlineProfessionalDevelopmentPostSurvey%'
              OR forms_submitted LIKE '%K5ProfessionalDevelopmentSurvey%'
              OR forms_submitted LIKE '%ProfessionalDevelopmentWorkshop%'
              OR forms_submitted LIKE '%ProfessionalDevelopmentWorkshopSignup%'
              OR form_roles LIKE '%educator%')
              AND roles NOT LIKE '%Teacher%'",
      min: 0,
      max: 0
    },
    {
      # Make sure that we have at least one form submitted recently so we know
      # replication is still working
      name: "Check that replication is working and that there are recent "\
            "form submissions",
      query: "SELECT count(*) FROM forms
              WHERE created_at > TIME(NOW() - INTERVAL 4 HOUR);",
      min: 1,
      max: 10_000_000
    }
  ].freeze

  def self.validate_contact_rollups
    overall_pass = true

    output = []
    # run each validation check
    DATA_CHECKS.each do |check|
      # run the validation query and get the returned count
      count = PEGASUS_REPORTING_DB_READER[check[:query]].first.first[1]
      # determine if the count is within validation bounds (inclusive)
      pass = count >= check[:min] && count <= check[:max]

      output_line = "#{check[:name]}: min #{check[:min]}, "\
                    "max #{check[:max]}. Actual: #{count} -> #{pass_fail_string(pass)}"
      log output_line

      output << output_line

      # keep track of if we have an overall pass
      overall_pass &&= pass
    end

    output << "Overall result: #{pass_fail_string(overall_pass)}"

    {pass: overall_pass, output: output.join("\n")}
  end

  # Returns "PASS" or "FAIL" based on Boolean value
  # @param pass [Boolean] input value
  # @return [String] "PASS" if input value true, otherwise "FAIL"
  def self.pass_fail_string(pass)
    pass ? "PASS" : "FAIL"
  end

  # Logs to CDO.log.info
  # @param s [String] string to log
  def self.log(s)
    # puts s unless Rails.env.test?
    CDO.log.info s
  end
end
