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
  }

  def initialize
    @new_prospects = []
    @updated_prospects = []
  end

  # Retrieves new email-id mappings from Pardot
  # @param [Integer] last_id
  # @return [Array] an array of hash {email, id}
  def self.retrieve_new_ids(last_id)
    # Run repeated requests querying for prospects above our highest known
    # Pardot ID. Up to 200 prospects will be returned at a time by Pardot, so
    # query repeatedly if there are more than 200 to retrieve.
    mappings = []

    loop do
      # Pardot request to return all prospects with ID greater than the last id.
      url = "#{PROSPECT_QUERY_URL}?id_greater_than=#{last_id}&fields=email,id&sort_by=id"
      doc = post_with_auth_retry(url)
      raise_if_response_error(doc)

      # Pardot returns the count total available prospects (not capped to 200),
      # although the data for a max of 200 are contained in the response.
      total_results = doc.xpath('/rsp/result/total_results').text.to_i
      results_in_response = 0

      # Process every prospect in the response.
      doc.xpath('/rsp/result/prospect').each do |node|
        id = node.xpath("id").text.to_i
        email = node.xpath("email").text
        results_in_response += 1
        last_id = id

        mappings << {email: email, pardot_id: id}
      end

      # Stop if all the remaining results were in this response - we're done. Otherwise, keep repeating.
      break if results_in_response == total_results
    end

    mappings
  end

  # Batch-creates prospects in Pardot.
  # Request is only sent to Pardot when the batch is big enough, unless +eager_submit+ is true.
  #
  # WARNING: If +eager_submit+ is false (by default), it is possible that the batch never gets
  # to the size that can trigger a Pardot request. Always uses this method together with its
  # sibling, +batch_create_remaining_prospects+ to flush out the remaining data in the batch.
  #
  # You can think of using this method as writing to an output stream, which at the end you
  # have to flush out the remaining content in the stream.
  #
  # @param [String] email
  # @param [Hash] data
  # @param [Boolean] eager_submit
  # @return [Array] two arrays, one for all submitted prospects and one for Pardot errors
  def batch_create_prospects(email, data, eager_submit = false)
    prospect = self.class.convert_to_prospect_fields data.merge(email: email)
    @new_prospects << prospect

    process_batch BATCH_CREATE_URL, @new_prospects, eager_submit
  end

  # Batch-creates prospect in Pardot. Request is sent immediately.
  def batch_create_remaining_prospects
    process_batch BATCH_CREATE_URL, @new_prospects, true
  end

  # @param [String] email
  # @param [Integer] pardot_id
  # @param [Hash] old_prospect_data Pardot prospect fields
  # @param [Hash] new_contact_data contact fields
  # @param [Boolean] eager_submit
  # @return [Array]
  def batch_update_prospects(email, pardot_id, old_prospect_data, new_contact_data, eager_submit = false)
    new_prospect_data = self.class.convert_to_prospect_fields new_contact_data
    delta = self.class.calculate_data_delta old_prospect_data, new_prospect_data
    return [], [] unless delta.present?

    prospect = delta.merge(
      self.class.convert_to_prospect_fields(email: email, pardot_id: pardot_id)
    )
    @updated_prospects << prospect

    process_batch BATCH_UPDATE_URL, @updated_prospects, eager_submit
  end

  def batch_update_remaining_prospects
    process_batch BATCH_UPDATE_URL, @updated_prospects, true
  end

  def process_batch(endpoint, prospects, eager_submit)
    return [], [] unless prospects.present?

    submissions = []
    errors = []
    url = self.class.build_batch_url endpoint, prospects

    if url.length > URL_LENGTH_THRESHOLD || prospects.size == MAX_PROSPECT_BATCH_SIZE || eager_submit
      # TODO: rescue Net::ReadTimeout from submit_prospect_batch and tolerate a certain number of failures.
      # Don't retry an insert because it will create duplicate Pardot prospects.
      errors = self.class.submit_batch_request endpoint, prospects
      submissions = prospects.clone
      prospects.clear
    end

    [submissions, errors]
  end

  # Converts contact fields to Pardot prospect fields.
  # @example
  #   input contact = {email: 'test@domain.com', pardot_id: 10, opt_in: true}
  #   output prospect = {email: 'test@domain.com', id: 10, db_Opt_In: 'Yes'}
  # @param [Hash] contact
  # @return [Hash]
  def self.convert_to_prospect_fields(contact)
    prospect = {}

    CONTACT_TO_PARDOT_PROSPECT_MAP.each do |key, prospect_info|
      next unless contact.key?(key)

      if prospect_info[:multi]
        # For multi data fields (multi-select, etc.), set key names as [field_name]_0, [field_name]_1, etc.
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
      prospect[:db_Opt_In] = contact[:opt_in] == true ? 'Yes' : 'No'
    end

    prospect
  end

  # Create a batch request URL containing one or more prospects in its query string.
  # Example return:
  #   https://pi.pardot.com/api/prospect/version/4/do/batchCreate?prospects=<data>
  #   data is in JSON format, e.g., {"prospects":[{"email":"some@email.com","name":"hello"}]}
  # @see: http://developer.pardot.com/kb/api-version-4/prospects/#endpoints-for-batch-processing
  #
  # @param [String] base_url Pardot API endpoint
  # @param [Array<Hash>] prospects array of prospect data
  # @return [String] an URL
  def self.build_batch_url(base_url, prospects)
    prospects_payload_json_encoded = URI.encode({prospects: prospects}.to_json)

    # Encode plus signs in email addresses because it is invalid in a query string
    # (even though it is valid in the base of a URL).
    prospects_payload_json_encoded = prospects_payload_json_encoded.gsub("+", "%2B")

    "#{base_url}?prospects=#{prospects_payload_json_encoded}"
  end

  # Submits a request to Pardot to create/update a batch of prospects.
  # This method may raise an exception.
  # @see http://developer.pardot.com/kb/api-version-4/prospects/#endpoints-for-batch-processing
  #
  # @param base_url [String] a Pardot API endpoint
  # @param prospects [Array<Hash>] array of prospect data
  # @return [Array] array of errors containing indexes of rejected prospects and error messages
  def self.submit_batch_request(base_url, prospects)
    return [] unless prospects.present?

    # Send request to Pardot
    url = build_batch_url base_url, prospects
    time_start = Time.now
    doc = post_with_auth_retry url
    time_elapsed = Time.now - time_start

    # Return indexes of rejected emails and their error messages
    errors = extract_batch_request_errors doc

    log "Completed a batch request to #{base_url} in #{time_elapsed.round(2)} secs. "\
      "#{prospects.length} prospects submitted. #{errors.length} rejected."

    errors
  end

  # Extracts errors from a Pardot response.
  # @param [Nokogiri::XML] doc Pardot XML response for a batch request
  # @return [Array] array of hashes, each containing an index and an error message
  def self.extract_batch_request_errors(doc)
    doc.xpath('/rsp/errors/*').map do |node|
      {prospect_index: node.attr("identifier").to_i, error_msg: node.text}
    end
  end

  # Calculates what needs to change to transform an old data to a new data.
  # @param [Hash] old_data
  # @param [Hash] new_data
  # @return [Hash]
  def self.calculate_data_delta(old_data, new_data)
    return new_data unless old_data.present?

    # Collect key-value pairs that exist only in the new data
    delta = {}
    new_data.each_pair do |key, val|
      delta[key] = val unless old_data.key?(key) && old_data[key] == val
    end

    # Remove entries that exist only in the old data and not in the new data
    old_data.each_pair do |key, _|
      delta[key] = nil unless new_data.key?(key)
    end

    delta
  end
end
