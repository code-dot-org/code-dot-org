# == Schema Information
#
# Table name: contact_rollups_processed
#
#  id         :integer          not null, primary key
#  email      :string(255)      not null
#  data       :json             not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_contact_rollups_processed_on_email  (email) UNIQUE
#

class ContactRollupsProcessed < ApplicationRecord
  self.table_name = 'contact_rollups_processed'

  DEFAULT_BATCH_SIZE = 10000

  # These JSON object keys are used to compile data from a contact_rollups_raw record
  # into a JSON object. They are shorten to single characters to reduce the size of
  # GROUP_CONCAT result and increase performance.
  SOURCES_KEY = 's'.freeze
  DATA_KEY = 'd'.freeze
  DATA_UPDATED_AT_KEY = 'u'.freeze

  # Constants used to speed up attribute processing:
  # Reverse lookup from section_type to course
  SECTION_TYPE_INVERTED_MAP = Pd::WorkshopConstants::SECTION_TYPE_MAP.invert
  HOC_YEAR_PATTERN = /HocSignup(?<year>\d{4})/
  # Allow only certain pegasus form roles since they are user-generated data
  ALLOWED_FORM_ROLES = %w(administrator educator engineer other parent student teacher volunteer).to_set

  FORM_KIND_TO_ROLE_MAP = {
    BringToSchool2013: 'Teacher',
    ClassSubmission: 'Teacher',
    DistrictPartnerSubmission: 'Teacher',
    HelpUs2013: 'Teacher',
    K5OnlineProfessionalDevelopmentPostSurvey: 'Teacher',
    K5ProfessionalDevelopmentSurvey: 'Teacher',
    ProfessionalDevelopmentWorkshop: 'Teacher',
    ProfessionalDevelopmentWorkshopSignup: 'Teacher',
    Petition: "Petition Signer",
  }

  # @see UserPermission::VALID_PERMISSIONS. We only care about a few permissions.
  USER_PERMISSION_TO_ROLE_MAP = {
    facilitator: 'Facilitator',
    workshop_organizer: 'Workshop Organizer',
    district_contact: 'District Contact',
  }

  # Aggregates data from contact_rollups_raw table and saves the results, one row per email.
  # @param batch_size [Integer] number of records to save per INSERT statement.
  # @return [Hash] number of valid and invalid contacts (emails) in the raw table
  def self.import_from_raw_table(batch_size = DEFAULT_BATCH_SIZE)
    valid_contacts = 0
    invalid_contacts = 0

    # Process the aggregated data row by row and save the results to DB in batches.
    batch = []
    ContactRollupsV2.retrieve_query_results(get_data_aggregation_query).each do |contact|
      begin
        contact.deep_stringify_keys!
        contact_data = parse_contact_data(contact['all_data_and_metadata'])
        valid_contacts += 1
      rescue JSON::ParserError, ArgumentError
        invalid_contacts += 1
        next
      end

      processed_contact_data = {}
      processed_contact_data.merge! extract_opt_in(contact_data)
      processed_contact_data.merge! extract_user_id(contact_data)
      processed_contact_data.merge! extract_professional_learning_enrolled(contact_data)
      processed_contact_data.merge! extract_professional_learning_attended(contact_data)
      processed_contact_data.merge! extract_hoc_organizer_years(contact_data)
      processed_contact_data.merge! extract_forms_submitted(contact_data)
      processed_contact_data.merge! extract_form_roles(contact_data)
      processed_contact_data.merge! extract_roles(contact_data)
      processed_contact_data.merge! extract_state(contact_data)
      processed_contact_data.merge! extract_city(contact_data)
      processed_contact_data.merge! extract_postal_code(contact_data)
      processed_contact_data.merge! extract_country(contact_data)
      processed_contact_data.merge! extract_updated_at(contact_data)

      # Contact data is successful processed, add it to a batch.
      # When the batch is big enough, save it to the database.
      batch << {email: contact['email'], data: processed_contact_data}
      next if batch.size < batch_size

      transaction do
        # Note: Skipping validation here because the only validation we need is that an email
        # is unique, which will be done at the DB level anyway thanks to an unique index on email.
        import! batch, validate: false
        batch = []
      end
    end
    transaction {import! batch, validate: false} unless batch.empty?

    {
      valid_contacts: valid_contacts,
      invalid_contacts: invalid_contacts
    }
  end

  def self.get_data_aggregation_query
    # Combines data and metadata for each record in contact_rollups_raw table into one JSON field.
    # The query result has the same number of rows as in contact_rollups_raw.
    data_transformation_query = <<-SQL.squish
      SELECT
        email,
        JSON_OBJECT(
          '#{SOURCES_KEY}', sources,
          '#{DATA_KEY}', data,
          '#{DATA_UPDATED_AT_KEY}', data_updated_at
        ) AS data_and_metadata
      FROM contact_rollups_raw
    SQL

    # Groups records by emails. Aggregates all data and metadata belong to an email into one JSON field.
    # Note: use GROUP_CONCAT instead of JSON_OBJECT_AGG because the current Aurora Mysql version in
    # production is 5.7.12, while JSON_OBJECT_AGG is only available from 5.7.22.
    # Because GROUP_CONCAT returns a string, we add a parser function to convert the result to a hash.
    <<-SQL.squish
      SELECT
        email,
        CONCAT('[', GROUP_CONCAT(data_and_metadata), ']') AS all_data_and_metadata
      FROM (#{data_transformation_query}) AS subquery
      GROUP BY email
    SQL
  end

  # Parses a JSON string containing contact data and metadata.
  # Throw exception if cannot parse the entire input string.
  #
  # @example
  #   Input string:
  #     '[{"s":"table1", "d":{"opt_in":1}, "u":"2020-06-16"}]'
  #      @see values of SOURCES_KEY, DATA_KEY and DATA_UPDATED_AT_KEY
  #   Output hash:
  #     {'table1'=>{
  #       'opt_in'=>[{'value'=>1, 'data_updated_at'=>2020-06-16}],
  #       'last_data_updated_at'=>2020-06-16
  #     }}
  # @see parse_contact_data test for more examples
  #
  # @param str [String] a JSON array string.
  #   Each array item is a hash {'sources'=>String, 'data'=>Hash, 'data_updated_at'=>DateTime}.
  #
  # @return [Hash] a hash with string keys.
  #   Output format:
  #     {source_table => {
  #       field_name => [{'value'=>String, 'data_updated_at'=>DateTime}]},
  #       'last_data_updated_at'=>DateTime
  #     }}
  #
  # @raise [JSON::ParserError] if cannot parse the input string to JSON
  # @raise [ArgumentError] if cannot parse a time value in the input string to Time
  def self.parse_contact_data(str)
    parsed_items = JSON.parse(str)

    {}.tap do |output|
      parsed_items.each do |item|
        # In a valid item, only +data+ value could be null
        sources = item[SOURCES_KEY]
        data = item[DATA_KEY] || {}
        data_updated_at = Time.find_zone('UTC').parse(item[DATA_UPDATED_AT_KEY])

        output[sources] ||= {}
        data.each_pair do |field, value|
          output[sources][field] ||= []
          output[sources][field] << {'value' => value, 'data_updated_at' => data_updated_at}
        end

        if !output[sources].key?('last_data_updated_at') ||
          data_updated_at > output[sources]['last_data_updated_at']
          output[sources]['last_data_updated_at'] = data_updated_at
        end
      end
    end
  end

  def self.extract_opt_in(contact_data)
    values = extract_field contact_data, 'dashboard.email_preferences', 'opt_in'
    # Since there should be no more than one opt_in value per contact,
    # we can just take the first value in the returned array.
    return values.empty? ? {} : {opt_in: values.first}
  end

  def self.extract_user_id(contact_data)
    values = extract_field contact_data, 'dashboard.users', 'user_id'
    # Since there should be no more than one user_id per contact,
    # we can just take the first value in the returned array.
    return values.empty? ? {} : {user_id: values.first}
  end

  def self.extract_professional_learning_enrolled(contact_data)
    values = extract_field contact_data, 'dashboard.pd_enrollments', 'course'
    # We only care about unique and non-nil values. The result is sorted to keep consistent order.
    # Assuming that all course values are valid, so we don't have to do string cleaning.
    # @see Pd::SharedWorkshopConstants::COURSES for the list of courses.
    uniq_values = values.uniq.compact.sort
    return uniq_values.empty? ? {} : {professional_learning_enrolled: uniq_values.join(',')}
  end

  def self.extract_professional_learning_attended(contact_data)
    # @see Pd::WorkshopConstants::SECTION_TYPES for section_type values
    # and Pd::SharedWorkshopConstants::COURSES for course values.
    section_types = extract_field contact_data, 'dashboard.followers', 'section_type'
    section_courses = section_types.map {|section| SECTION_TYPE_INVERTED_MAP[section]}
    courses = extract_field contact_data, 'dashboard.pd_attendances', 'course'

    # Only care about unique and non-nil value. The result is sorted to keep consistent order.
    uniq_courses = (courses + section_courses).uniq.compact.sort.join(',')
    return uniq_courses.empty? ? {} : {professional_learning_attended: uniq_courses}
  end

  def self.extract_roles(contact_data)
    roles = Set.new
    # Contact is a teacher if they appears in any of the following tables
    roles.add 'Teacher' if
      contact_data.dig('dashboard.users', 'user_id') ||
      contact_data.key?('dashboard.pd_enrollments') ||
      contact_data.key?('dashboard.pd_attendances') ||
      contact_data.key?('dashboard.followers')

    unless roles.include? 'Teacher'
      # Contact is a teacher if they submit a census survey as a teacher
      submitter_roles = extract_field contact_data, 'dashboard.census_submissions', 'submitter_role'
      roles.add 'Teacher' if submitter_roles.include? Census::CensusSubmission::ROLES[:teacher]
    end

    # Contact is a teacher or a petition signer if they submit certain (pegasus) forms
    form_kinds = extract_field contact_data, 'pegasus.forms', 'kind'
    roles.merge(form_kinds.map {|kind| FORM_KIND_TO_ROLE_MAP[kind&.to_sym]})

    # TODO: extract course family_name (in properties column) instead of course name.
    courses = extract_field contact_data, 'dashboard.sections', 'course_name'
    roles.add 'CSD Teacher' if courses.any? {|course| course&.start_with? 'csd'}
    roles.add 'CSP Teacher' if courses.any? {|course| course&.start_with? 'csp'}

    # @see Script model, csf?, csd? and csp? methods
    curricula = extract_field contact_data, 'dashboard.sections', 'curriculum_umbrella'
    roles.add 'CSF Teacher' if curricula.any? {|curriculum| curriculum == 'CSF'}
    roles.add 'CSD Teacher' if !roles.include?('CSD Teacher') &&
      curricula.any? {|curriculum| curriculum == 'CSD'}
    roles.add 'CSP Teacher' if !roles.include?('CSP Teacher') &&
      curricula.any? {|curriculum| curriculum == 'CSP'}

    roles.add 'Form Submitter' if
      contact_data.key?('pegasus.forms') ||
      contact_data.key?('dashboard.census_submissions')

    roles.add 'Parent' if contact_data.dig('dashboard.users', 'is_parent')

    permissions = extract_field contact_data, 'dashboard.user_permissions', 'permission'
    roles.merge(permissions.map {|permission| USER_PERMISSION_TO_ROLE_MAP[permission&.to_sym]})

    # Only care about unique and non-nil values. Values are sorted before return.
    uniq_roles = roles.to_a.compact.sort.join(',')
    uniq_roles.blank? ? {} : {roles: uniq_roles}
  end

  def self.extract_hoc_organizer_years(contact_data)
    kinds = extract_field contact_data, 'pegasus.forms', 'kind'
    hoc_years = kinds.uniq.map do |kind|
      if kind == 'CSEdWeekEvent2013'
        '2013'
      else
        # Get year from kind value, such as 'HocSignup2014' and 'HocSignup2019'
        HOC_YEAR_PATTERN.match(kind)&.[](:year)
      end
    end

    # Only care about unique and non-nil value. The result is sorted to keep consistent order.
    uniq_hoc_years = hoc_years.uniq.compact.sort.join(',')
    return uniq_hoc_years.empty? ? {} : {hoc_organizer_years: uniq_hoc_years}
  end

  def self.extract_forms_submitted(contact_data)
    kinds = extract_field contact_data, 'pegasus.forms', 'kind'
    kinds << 'Census' if contact_data.key?('dashboard.census_submissions')

    uniq_kinds = kinds.uniq.compact.sort.join(',')
    uniq_kinds.empty? ? {} : {forms_submitted: uniq_kinds}
  end

  def self.extract_form_roles(contact_data)
    # @see Census::CensusSubmission::ROLES for submitter_role values
    census_roles = extract_field contact_data, 'dashboard.census_submissions', 'submitter_role'
    cleaned_census_roles = census_roles.compact.map(&:downcase)

    # pegasus form roles are user-generated data, use an allowed list to filter them
    pegasus_roles = extract_field contact_data, 'pegasus.forms', 'role'
    cleaned_pegasus_roles = pegasus_roles.
      compact.
      map(&:downcase).
      select {|role| ALLOWED_FORM_ROLES.include? role}

    uniq_form_roles = (cleaned_census_roles + cleaned_pegasus_roles).uniq.sort.join(',')
    return uniq_form_roles.empty? ? {} : {form_roles: uniq_form_roles}
  end

  def self.extract_state(contact_data)
    # The priority is: school state > user state > form geo state
    # US state in schools table is in abbreviation, must convert it back to state name.
    school_state = extract_field_latest_value contact_data, 'dashboard.schools', 'state'
    if school_state
      state_name = get_us_state_from_abbr(school_state, true) || school_state
      return {state: state_name}
    end

    user_state = extract_field_latest_value contact_data, 'dashboard.users', 'state'
    return {state: user_state} if user_state

    form_geo_state = extract_field_latest_value contact_data, 'pegasus.form_geos', 'state'
    form_geo_state.nil? ? {} : {state: form_geo_state}
  end

  def self.extract_city(contact_data)
    # Priority: school city > user city > form geo city
    school_city = extract_field_latest_value contact_data, 'dashboard.schools', 'city'
    return {city: school_city} if school_city

    user_city = extract_field_latest_value contact_data, 'dashboard.users', 'city'
    return {city: user_city} if user_city

    form_geo_city = extract_field_latest_value contact_data, 'pegasus.form_geos', 'city'
    form_geo_city.nil? ? {} : {city: form_geo_city}
  end

  def self.extract_country(contact_data)
    # Priority: user country > form geo country
    user_country = extract_field_latest_value contact_data, 'dashboard.users', 'country'
    return {country: user_country} if user_country

    form_geo_country = extract_field_latest_value contact_data, 'pegasus.form_geos', 'country'
    form_geo_country.nil? ? {} : {country: form_geo_country}
  end

  def self.extract_postal_code(contact_data)
    # Priority: school zip > user postal code > form geo postal code
    school_zip = extract_field_latest_value contact_data, 'dashboard.schools', 'zip'
    return {postal_code: school_zip} if school_zip

    user_postal_code = extract_field_latest_value contact_data, 'dashboard.users', 'postal_code'
    return {postal_code: user_postal_code} if user_postal_code

    form_geo_postal_code = extract_field_latest_value contact_data, 'pegasus.form_geos', 'postal_code'
    form_geo_postal_code.nil? ? {} : {postal_code: form_geo_postal_code}
  end

  # Extract the latest value of a field in a source table from contact data.
  # @param contact_data [Hash] output of the +parse_contact_data+ method
  # @param table [String]
  # @param field [String]
  # @return the latest value or nil if no value exists
  def self.extract_field_latest_value(contact_data, table, field)
    values = contact_data.dig(table, field)
    values.blank? ? nil : values.max_by {|value| value['data_updated_at']}['value']
  end

  # Extracts values of a field in a source table from contact data.
  #
  # @param contact_data [Hash] compiled data from multiple source tables.
  #   @see output of +parse_contact_data+ method.
  # @param table [String]
  # @param field [String]
  # @return [Array] an array of values, or an empty array if the field or table
  #   does not exist in the contact_data.
  def self.extract_field(contact_data, table, field)
    return [] unless contact_data.key?(table) && contact_data[table].key?(field)
    contact_data.dig(table, field).map {|item| item['value']}
  end

  # Extracts the latest data_updated_at value.
  #
  # @param [Hash] contact_data @see output of parse_contact_data method.
  # @return [Hash] a hash containing updated_at key and non-nil value
  #
  # @raise [StandardError] if couldn't find non-nil data_updated_at value
  def self.extract_updated_at(contact_data)
    # contact_data contains data from multiple sources (tables).
    # For each source, there MUST be a non-nil last_data_updated_at value.
    # @see the output of +parse_contact_data+ method.
    max_data_updated_at = contact_data.values.map do |source_data|
      source_data['last_data_updated_at']
    end.max

    raise 'Missing data_updated_at value' unless max_data_updated_at
    {updated_at: max_data_updated_at}
  end
end
