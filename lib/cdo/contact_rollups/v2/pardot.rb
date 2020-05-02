require_relative 'pardot_helpers'

class PardotV2
  extend PardotHelpers

  API_V4_BASE = "https://pi.pardot.com/api/prospect/version/4".freeze
  PROSPECT_QUERY_URL = "#{API_V4_BASE}/do/query".freeze
  BATCH_CREATE_URL = "#{API_V4_BASE}/do/batchCreate".freeze
  BATCH_UPDATE_URL = "#{API_V4_BASE}/do/batchUpdate".freeze

  URL_LENGTH_THRESHOLD = 6000
  MAX_PROSPECT_BATCH_SIZE = 50

  CONTACT_TO_PARDOT_PROSPECT_MAP = {
    email: {field: :email},
    pardot_id: {field: :id},
    # Note: db_* fields are sorted alphabetically
    city: {field: :db_City},
    country: {field: :db_Country},
    form_roles: {field: :db_Form_Roles},
    forms_submitted: {field: :db_Forms_Submitted},
    hoc_organizer_years: {field: :db_Hour_of_Code_Organizer, multi: true},
    postal_code: {field: :db_Postal_Code},
    professional_learning_attended: {field: :db_Professional_Learning_Attended, multi: true},
    professional_learning_enrolled: {field: :db_Professional_Learning_Enrolled, multi: true},
    roles: {field: :db_Roles, multi: true},
    state: {field: :db_State},
  }.freeze

  def initialize
    @new_prospects = []
    @updated_prospects = []
    @updated_prospect_deltas = []
  end

  # Retrieves new (email, Pardot ID) mappings from Pardot
  #
  # @param [Integer] last_id retrieves only Pardot ID greater than this value
  # @param [Array<String>] a list of fields. Must have 'id' the list. Field names must be url-safe.
  # @param [Integer] limit maximum number of prospects to retrieve
  # @return [Integer] number of results retrieved
  #
  # @yieldreturn [Array<Hash>] an array of hash of prospect data
  # @raise [ArgumentError] if 'id' is not in the list of fields
  # @raise [StandardError] if receives errors in Pardot response
  def self.retrieve_prospects(last_id, fields, limit = nil)
    raise ArgumentError.new("Missing value 'id' in fields argument") unless fields.include? 'id'
    total_results_retrieved = 0

    # Run repeated requests querying for prospects above our highest known Pardot ID.
    loop do
      url = "#{PROSPECT_QUERY_URL}?id_greater_than=#{last_id}&fields=#{fields.join(',')}&sort_by=id"
      url += "&limit=#{limit}" if limit
      doc = post_with_auth_retry(url)
      raise_if_response_error(doc)

      # Pardot returns the count total available prospects (not capped to 200),
      # although the data for a max of 200 are contained in the response.
      # The total prospects count changes in each loop iteration because the url we
      # send to Pardot also changes.
      # @see http://developer.pardot.com/kb/api-version-4/prospects/#xml-response-format
      total_results = doc.xpath('/rsp/result/total_results').text.to_i

      results_in_response = 0
      prospects = []
      doc.xpath('/rsp/result/prospect').each do |node|
        prospect = {}
        fields.each do |field|
          value = node.xpath(field).text
          prospect.merge!({field => value})
        end
        prospects << prospect

        last_id = prospect['id']
        results_in_response += 1
      end

      yield prospects if block_given?
      log "Retrieved #{results_in_response}/#{total_results} new Pardot IDs. Last Pardot ID = #{last_id}."

      # Stop if all the remaining results were in this response or we reached the download limit.
      total_results_retrieved += results_in_response
      break if results_in_response == total_results ||
        (limit && total_results_retrieved >= limit)
    end

    total_results_retrieved
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
    prospect = new_prospect_data.merge email_pardot_id
    @updated_prospects << prospect
    prospect_delta = delta.merge email_pardot_id
    @updated_prospect_deltas << prospect_delta

    delta_submissions, errors = process_batch BATCH_UPDATE_URL, @updated_prospect_deltas, eager_submit
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
    delta_submissions, errors = process_batch BATCH_UPDATE_URL, @updated_prospect_deltas, true
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
      # TODO: Rescue Net::ReadTimeout from submit_prospect_batch and tolerate a certain number of failures.
      #   Use an instance variable to remember the number of failures.
      errors = self.class.submit_batch_request api_endpoint, prospects
      submissions = prospects.clone
      prospects.clear
    end

    [submissions, errors]
  end

  # Converts contact keys and values to Pardot prospect keys and values.
  # @example
  #   input contact = {email: 'test@domain.com', pardot_id: 10, opt_in: 1}
  #   output prospect = {email: 'test@domain.com', id: 10, db_Opt_In: 'Yes'}
  # @param [Hash] contact
  # @return [Hash]
  def self.convert_to_pardot_prospect(contact)
    prospect = {}

    CONTACT_TO_PARDOT_PROSPECT_MAP.each do |key, prospect_info|
      next unless contact.key?(key)

      if prospect_info[:multi]
        # For multi data fields (multi-select, etc.), set key names as [field_name]_0, [field_name]_1, etc.
        # @see http://developer.pardot.com/kb/api-version-4/prospects/#updating-fields-with-multiple-values
        contact[key].split(',').each_with_index do |value, index|
          prospect["#{prospect_info[:field]}_#{index}"] = value
        end
      else
        prospect[prospect_info[:field]] = contact[key]
      end
    end

    # Pardot db_Opt_In field has type "Dropdown" with permitted values "Yes" or "No".
    # @see https://pi.pardot.com/prospectFieldCustom/read/id/9514
    if contact.key?(:opt_in)
      prospect[:db_Opt_In] = contact[:opt_in] == 1 ? 'Yes' : 'No'
    end

    prospect
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

  # Calculates what needs to change to transform an old data to a new data.
  # Example:
  #   old_data = {key1: 1, key2: 2, key3: nil}
  #   new_data = {key1: 1.1, k4: 4}
  #   delta output = {key1: 1.1, key2: nil, key4: 4}
  #   The output means to transform old_data into new_data, we have to reset value for key1,
  #   unset key2 value (i.e. set it to nil), ignore key3 (because its old value was nil)
  #   and set key4.
  #
  # @param [Hash] old_data
  # @param [Hash] new_data
  # @return [Hash]
  def self.calculate_data_delta(old_data, new_data)
    return new_data unless old_data.present?

    # Set key-value pairs that exist only in the new data
    delta = {}
    new_data.each_pair do |key, val|
      delta[key] = val unless old_data.key?(key) && old_data[key] == val
    end

    # Unset entries that exist only in the old data and not in the new data.
    # Ignore entries with values are nil.
    old_data.each_pair do |key, val|
      delta[key] = nil unless new_data.key?(key) || val.nil?
    end

    delta
  end
end
