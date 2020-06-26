require_relative 'pardot_helpers'

class PardotV2
  extend PardotHelpers

  API_V4_BASE = "https://pi.pardot.com/api/prospect/version/4".freeze
  PROSPECT_QUERY_URL = "#{API_V4_BASE}/do/query".freeze
  PROSPECT_READ_URL = "#{API_V4_BASE}/do/read/email".freeze
  PROSPECT_DELETION_URL = "#{API_V4_BASE}/do/delete/id".freeze
  BATCH_CREATE_URL = "#{API_V4_BASE}/do/batchCreate".freeze
  BATCH_UPDATE_URL = "#{API_V4_BASE}/do/batchUpdate".freeze

  URL_LENGTH_THRESHOLD = 6000
  MAX_PROSPECT_BATCH_SIZE = 50

  # Map from contact fields to Pardot prospect fields
  CONTACT_TO_PARDOT_PROSPECT_MAP = {
    email: :email,
    pardot_id: :id,
    # Note: db_* fields are sorted alphabetically
    city: :db_City,
    country: :db_Country,
    form_roles: :db_Form_Roles,
    forms_submitted: :db_Forms_Submitted,
    hoc_organizer_years: :db_Hour_of_Code_Organizer,
    postal_code: :db_Postal_Code,
    professional_learning_attended: :db_Professional_Learning_Attended,
    professional_learning_enrolled: :db_Professional_Learning_Enrolled,
    roles: :db_Roles,
    state: :db_State,
  }.freeze

  # Pardot multi-value or multi-select fields
  MULTI_VALUE_PROSPECT_FIELDS = [
    :db_Hour_of_Code_Organizer,
    :db_Professional_Learning_Attended,
    :db_Professional_Learning_Enrolled,
    :db_Roles
  ].to_set

  def initialize(is_dry_run: false)
    @new_prospects = []
    @updated_prospects = []
    @updated_prospect_deltas = []

    # Relevant only during dry runs
    @dry_run = is_dry_run
    @dry_run_api_endpoints_hit = []
  end

  # Retrieves new (email, Pardot ID) mappings from Pardot
  #
  # @param [Integer] last_id retrieves only Pardot ID greater than this value
  # @param [Array<String>] fields url-safe prospect field names. Must have 'id' the list.
  # @param [Integer] limit the maximum number of prospects to retrieve
  # @param [Boolean] only_deleted get deleted prospects (default false). Note this is in place of non-deleted prospects, not in addition to.
  # @return [Integer] number of results retrieved
  #
  # @yieldreturn [Array<Hash>] an array of hash of prospect data
  # @raise [ArgumentError] if 'id' is not in the list of fields
  # @raise [StandardError] if receives errors in Pardot response
  def self.retrieve_prospects(last_id, fields, limit = nil, only_deleted = false)
    raise ArgumentError.new("Missing value 'id' in fields argument") unless fields.include? 'id'
    total_results_retrieved = 0

    # Limit the number of prospects retrieved in each API call if the overall limit is less than 200.
    # @see http://developer.pardot.com/kb/api-version-4/prospects/#manipulating-the-result-set
    limit_in_query = limit && limit < 200 ? limit : nil

    # Run repeated requests querying for prospects above our highest known Pardot ID.
    # Stop when receiving no prospects or reaching the download limit.
    loop do
      url = build_prospect_query_url(last_id, fields, limit_in_query, only_deleted)
      doc = try_with_exponential_backoff(3) do
        post_with_auth_retry url
      end
      raise_if_response_error(doc)

      prospects = []
      doc.xpath('/rsp/result/prospect').each do |node|
        prospect = extract_prospect_from_response(node, fields)
        prospects << prospect
        last_id = prospect['id']
      end
      break if prospects.empty?

      yield prospects if block_given?

      total_results_retrieved += prospects.length
      log "Retrieved #{total_results_retrieved} prospects. Last Pardot ID = #{last_id}."\
        " #{limit.nil? ? 'No limit' : "Limit = #{limit}"}."
      break if limit && total_results_retrieved >= limit
    end

    total_results_retrieved
  end

  # Creates URL and query string for use with Pardot prospect query API
  # @param id_greater_than [String, Integer]
  # @param fields [Array<String>]
  # @param limit [String, Integer]
  # @param deleted [Boolean]
  # @return [String]
  def self.build_prospect_query_url(id_greater_than, fields, limit, deleted)
    # Use bulk output format as recommended at http://developer.pardot.com/kb/bulk-data-pull/.
    url = "#{PROSPECT_QUERY_URL}?output=bulk&sort_by=id"
    url += "&id_greater_than=#{id_greater_than}" if id_greater_than
    url += "&fields=#{fields.join(',')}" if fields
    url += "&limit=#{limit}" if limit
    url += "&deleted=true" if deleted
    url
  end

  # Compiles a batch of prospects and batch-create them in Pardot when batch size
  # is big enough. If +eager_submit+ is true, creates the batch in Pardot immediately.
  #
  # *Warning:* By default, +eager_submit+ is false. It is possible that the batch never gets
  # to the size that can trigger a Pardot request. Always uses this method together with its
  # sibling, +batch_create_remaining_prospects+ to flush out the remaining data in the batch.
  #
  # You can think of using this method as writing to an output stream, which at the end you
  # have to flush out the remaining content in the stream.
  #
  # @param [String] email
  # @param [Hash] data
  # @param [Boolean] eager_submit
  # @return [Array<Array>] @see process_batch method
  def batch_create_prospects(email, data, eager_submit = false)
    prospect = self.class.convert_to_pardot_prospect data.merge(email: email)
    @new_prospects << prospect

    # Creating new prospects is not a retriable action because it could succeed
    # on the Pardot side and we just didn't receive a response. If we try again,
    # it would create duplicate prospects.
    process_batch BATCH_CREATE_URL, @new_prospects, eager_submit
  end

  # Immediately batch-create the remaining prospects in Pardot.
  # @return [Array<Array>] @see process_batch method
  def batch_create_remaining_prospects
    process_batch BATCH_CREATE_URL, @new_prospects, true
  end

  # Compiles a batch of prospects and batch-update them in Pardot when batch size
  # is big enough. If +eager_submit+ is true, updates the batch in Pardot immediately.
  #
  # *Warning:* If +eager_submit+ is false (by default), always uses this method together with
  # its sibling, +batch_update_remaining_prospects+ to flush out the remaining data in the batch.
  #
  # @param [String] email
  # @param [Integer] pardot_id
  # @param [Hash] old_prospect_data a hash with Pardot prospect keys
  # @param [Hash] new_contact_data a hash with original contact keys
  # @param [Boolean] eager_submit
  # @return [Array<Array>] @see process_batch method
  def batch_update_prospects(email, pardot_id, old_prospect_data, new_contact_data, eager_submit = false)
    new_prospect_data = self.class.convert_to_pardot_prospect new_contact_data
    delta = self.class.calculate_data_delta old_prospect_data, new_prospect_data
    return [], [] unless delta.present?

    email_pardot_id = self.class.convert_to_pardot_prospect(email: email, pardot_id: pardot_id)
    prospect = email_pardot_id.merge new_prospect_data
    @updated_prospects << prospect
    prospect_delta = email_pardot_id.merge delta
    @updated_prospect_deltas << prospect_delta

    delta_submissions, errors = self.class.try_with_exponential_backoff(3) do
      process_batch BATCH_UPDATE_URL, @updated_prospect_deltas, eager_submit
    end
    return [], [] unless delta_submissions.present?

    # As an optimization, we only send the deltas to Pardot. However, as far as
    # the caller's concerned, we have sent the entire contact data to Pardot.
    full_submissions = @updated_prospects
    @updated_prospects = []
    [full_submissions, errors]
  end

  # Immediately batch-update the remaining prospects in Pardot.
  # @return [Array<Array>] @see process_batch method
  def batch_update_remaining_prospects
    delta_submissions, errors = self.class.try_with_exponential_backoff(3) do
      process_batch BATCH_UPDATE_URL, @updated_prospect_deltas, true
    end
    return [], [] unless delta_submissions.present?

    full_submissions = @updated_prospects
    @updated_prospects = []
    [full_submissions, errors]
  end

  # Submits a request to a Pardot API endpoint if the prospect batch size is big enough
  # or +eager_submit+ is true. Otherwise, does nothing.
  #
  # *Warning:* This is not a pure method. It clears +prospects+ array once a request
  # is successfully send to Pardot.
  #
  # @param [String] api_endpoint
  # @param [Array<Hash>] prospects
  # @param [Boolean] eager_submit if is true, triggers submitting request immediately
  # @return [Array<Array>] two arrays, one for all submitted prospects and one for Pardot errors
  def process_batch(api_endpoint, prospects, eager_submit)
    return [], [] unless prospects.present?

    submissions = []
    errors = []
    url = self.class.build_batch_url api_endpoint, prospects

    if url.length > URL_LENGTH_THRESHOLD || prospects.size == MAX_PROSPECT_BATCH_SIZE || eager_submit
      if @dry_run
        # During a dry run, we want to display two example batch of prospects.
        # One for newly created prospects, and one for updated prospects.
        # If we did not include this limit, the entire batch would be displayed,
        # which could be overwhelming for debugging purposes.
        unless @dry_run_api_endpoints_hit.include? api_endpoint
          self.class.log "Prospects in sample batch to sync to Pardot: #{prospects.length}"
          self.class.log "Query string for sample batch:\n#{url}"
          self.class.log 'Prospects to be synced in sample batch:'
          prospects.each do |prospect|
            self.class.log prospect
          end

          @dry_run_api_endpoints_hit << api_endpoint
        end
      else
        errors = self.class.submit_batch_request api_endpoint, prospects
      end

      submissions = prospects.clone
      prospects.clear
    end

    [submissions, errors]
  end

  # Deletes all prospects with the same email address from Pardot.
  # @param email [String]
  # @return [Boolean] all prospects are deleted or not
  def self.delete_prospects_by_email(email)
    pardot_ids = retrieve_pardot_ids_by_email(email)

    success = true
    pardot_ids.each do |id|
      success = false unless delete_prospect_by_id(id)
    end
    success
  end

  # Deletes a prospect from Pardot using Pardot Id.
  # This method only runs in the production environment to avoid accidentally deleting prospect.
  # @param [Integer, String] pardot_id of the prospects to be deleted.
  # @return [Boolean] deletion succeeds or not
  def self.delete_prospect_by_id(pardot_id)
    if CDO.rack_env != :production
      log "#{__method__} only runs in production. The current environment is #{CDO.rack_env}."
      return false
    end

    # @see http://developer.pardot.com/kb/api-version-4/prospects/#using-prospects
    post_with_auth_retry "#{PROSPECT_DELETION_URL}/#{pardot_id}"
    true
  rescue StandardError => e
    # If the input pardot_id does not exist, Pardot will response with
    # HTTP code 400 and error code 3 "Invalid prospect ID" in the body.
    return false if e.message =~ /Pardot request failed with HTTP 400/
    raise e
  end

  # Finds prospects using email address and extract their Pardot ids.
  # @param email [String]
  # @return [Array<String>]
  def self.retrieve_pardot_ids_by_email(email)
    doc = post_with_auth_retry "#{PROSPECT_READ_URL}/#{email}"
    doc.xpath('//prospect/id').map(&:text)
  rescue StandardError => e
    # If the input email does not exist, Pardot will response with
    # HTTP code 400, and error code 4 "Invalid prospect email address" in the body.
    return [] if e.message =~ /Pardot request failed with HTTP 400/
    raise e
  end

  # Converts contact keys and values to Pardot prospect keys and values.
  # @example
  #   input contact = {email: 'test@domain.com', pardot_id: 10, opt_in: 1}
  #   output prospect = {email: 'test@domain.com', id: 10, db_Opt_In: 'Yes'}
  # @param contact [Hash] a hash with symbol keys
  # @return [Hash] a hash with symbol keys
  def self.convert_to_pardot_prospect(contact)
    prospect = {}

    CONTACT_TO_PARDOT_PROSPECT_MAP.each do |contact_field, prospect_field|
      next unless contact.key? contact_field

      if MULTI_VALUE_PROSPECT_FIELDS.include? prospect_field
        # For multi-value fields (multi-select, etc.), set key names as [field_name]_0, [field_name]_1, etc.
        # Also sort its values to keep consistent order.
        # @see http://developer.pardot.com/kb/api-version-4/prospects/#updating-fields-with-multiple-values
        contact[contact_field].split(',').sort.each_with_index do |value, index|
          split_key = "#{prospect_field}_#{index}".to_sym
          prospect[split_key] = value
        end
      else
        prospect[prospect_field] = contact[contact_field]
      end
    end

    # Pardot db_Opt_In field has type "Dropdown" with permitted values "Yes" or "No".
    # @see https://pi.pardot.com/prospectFieldCustom/read/id/9514
    if contact.key?(:opt_in)
      prospect[:db_Opt_In] = contact[:opt_in] == 1 ? 'Yes' : 'No'
    end

    prospect[:db_Has_Teacher_Account] = 'true' if contact[:user_id]

    prospect
  end

  # Extracts prospect info from a prospect node in a Pardot's XML response.
  # @see test method for example.
  # @param [Nokogiri::XML::Element] prospect_node
  # @param [Array<String>] fields
  # @return [Hash]
  def self.extract_prospect_from_response(prospect_node, fields)
    {}.tap do |prospect|
      fields.each do |field|
        # Collect all text values for this field
        field_node = prospect_node.xpath(field)
        values = field_node.children.map(&:text)
        next if values.empty?

        if MULTI_VALUE_PROSPECT_FIELDS.include? field.to_sym
          # For a multi-value field, to be consistent with how we update it to Pardot,
          # set key names as [field]_0, [field]_1 etc., and sort its values.
          # @see +convert_to_pardot_prospect+ method and its tests.
          values.sort.each_with_index do |value, index|
            prospect["#{field}_#{index}"] = value
          end
        else
          prospect[field] = values.first
        end
      end
    end
  end

  # Create a batch request URL containing one or more prospects in its query string.
  # Example return:
  #   https://pi.pardot.com/api/prospect/version/4/do/batchCreate?prospects=<data>
  #   data is in JSON format, e.g., {"prospects":[{"email":"some@email.com","name":"hello"}]}
  # @see: http://developer.pardot.com/kb/api-version-4/prospects/#endpoints-for-batch-processing
  #
  # @param [String] api_endpoint
  # @param [Array<Hash>] prospects an array of prospect data
  # @return [String] a URL
  def self.build_batch_url(api_endpoint, prospects)
    prospects_payload_json_encoded = URI.encode({prospects: prospects}.to_json)

    # Encode plus signs in email addresses because it is invalid in a query string
    # (even though it is valid in the base of a URL).
    prospects_payload_json_encoded = prospects_payload_json_encoded.gsub("+", "%2B")

    "#{api_endpoint}?prospects=#{prospects_payload_json_encoded}"
  end

  # Submits a request to Pardot to create/update a batch of prospects.
  # @see http://developer.pardot.com/kb/api-version-4/prospects/#endpoints-for-batch-processing
  #
  # @param api_endpoint [String] a Pardot API endpoint
  # @param prospects [Array<Hash>] an array of prospect data
  # @return [Array<Hash>] @see extract_batch_request_errors method
  #
  # @raise [Net::ReadTimeout] if doesn't get a response from Pardot
  def self.submit_batch_request(api_endpoint, prospects)
    return [] unless prospects.present?

    # Send request to Pardot
    url = build_batch_url api_endpoint, prospects
    time_start = Time.now.utc
    doc = post_with_auth_retry url
    time_elapsed = Time.now.utc - time_start

    # Return indexes of rejected emails and their error messages
    errors = extract_batch_request_errors doc

    log "Completed a batch request to #{api_endpoint} in #{time_elapsed.round(2)} secs. "\
      "#{prospects.length} prospects submitted. #{errors.length} rejected."

    errors
  end

  # Extracts errors from a Pardot response.
  # @param [Nokogiri::XML] doc a Pardot XML response for a batch request
  # @return [Array<Hash>] an array of hashes, each containing an index and an error message
  def self.extract_batch_request_errors(doc)
    doc.xpath('/rsp/errors/*').map do |node|
      {prospect_index: node.attr("identifier").to_i, error_msg: node.text}
    end
  end

  # Identifies additional information that is in new data but not in old data.
  # Example:
  #   old_data = {key1: 'v1', key2: 'v2', key3: nil}
  #   new_data = {key1: 'v1.1', key2: 'v2', key4: 'v4'}
  #   delta output = {key1: 'v1.1', key4: 'v4'}
  #   The output means there is a new value for key1,
  #   key2 and key3 are ignored (no new information about these keys in new_data),
  #   and set key4 for the first time.
  #
  # @param [Hash] old_data
  # @param [Hash] new_data
  # @return [Hash]
  def self.calculate_data_delta(old_data, new_data)
    return new_data unless old_data.present?

    # Set key-value pairs that exist only in the new data
    {}.tap do |delta|
      new_data.each_pair do |key, val|
        delta[key] = val unless old_data.key?(key) && old_data[key] == val
      end
    end
  end
end
