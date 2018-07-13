require File.expand_path('../../../pegasus/src/env', __FILE__)
require 'net/http'
require 'net/http/responses'
require_relative('../../dashboard/config/environment')
require 'cdo/properties'

# Global variable for Pardot API key. This can become invalid and need to be refreshed
# and replaced midstream.
$pardot_api_key = nil

class Pardot
  # URL for Pardot login
  PARDOT_AUTHENTICATION_URL = "https://pi.pardot.com/api/login/version/4".freeze

  PARDOT_API_V4_BASE = "https://pi.pardot.com/api/prospect/version/4".freeze
  # URL for prospect batch creation
  PARDOT_BATCH_CREATE_URL = "#{PARDOT_API_V4_BASE}/do/batchCreate".freeze
  # URL for prospect batch update
  PARDOT_BATCH_UPDATE_URL = "#{PARDOT_API_V4_BASE}/do/batchUpdate".freeze
  # URL for prospect query
  PARDOT_PROSPECT_QUERY_URL = "#{PARDOT_API_V4_BASE}/do/query".freeze
  # URL for prospect deletion
  PARDOT_PROSPECT_DELETION_URL = "#{PARDOT_API_V4_BASE}/do/delete/id".freeze

  PARDOT_SUCCESS_HTTP_CODES = %w(200 201 204).freeze

  # Max # of prospects allowed in one batch
  MAX_PROSPECT_BATCH_SIZE = 50
  # Empirically determined safe max URL length for batch operations
  URL_LENGTH_SEND_THRESHOLD = 6000

  # Map of database fields to Pardot field names. "multi" refers to if the field
  # is a multi-valued type (such as checkbox list)
  MYSQL_TO_PARDOT_MAP = {
    email: {field: 'email', multi: false},
    pardot_id: {field: 'id', multi: false},
    name: {field: 'db_Name', multi: false},
    street_address: {field: 'db_Street_Address', multi: false},
    city: {field: 'db_City', multi: false},
    state: {field: 'db_State', multi: false},
    postal_code: {field: 'db_Postal_Code', multi: false},
    country: {field: 'db_Country', multi: false},
    district_name: {field: 'db_District', multi: false},
    district_city: {field: 'db_District_City', multi: false},
    district_state: {field: 'db_District_State', multi: false},
    school_name: {field: 'db_School', multi: false},
    roles: {field: 'db_Roles', multi: true},
    courses_facilitated: {field: 'db_Facilitator_Type', multi: true},
    professional_learning_enrolled: {
      field: 'db_Professional_Learning_Enrolled',
      multi: true
    },
    professional_learning_attended: {
      field: 'db_Professional_Learning_Attended',
      multi: true
    },
    hoc_organizer_years: {field: 'db_Hour_of_Code_Organizer', multi: true},
    grades_taught: {field: 'db_Grades_Taught', multi: true},
    ages_taught: {field: 'db_Ages_Taught', multi: true},
    forms_submitted: {field: 'db_Forms_Submitted', multi: false},
    form_roles: {field: 'db_Form_Roles', multi: false}
  }.freeze

  # Exception to throw to ourselves if Pardot API key is invalid (which probably
  # means it needs to be re-authed)
  class InvalidApiKeyException < RuntimeError
  end

  # Deletes a list of prospects from Pardot. For Pardot API documentation, see
  # http://developer.pardot.com/kb/api-version-4/prospects/#using-prospects.
  # @param [Array[Integer]] prospect_ids of the prospects to be deleted.
  # @return [Array[Integer]] the set of prospect_ids that failed to be deleted.
  def self.delete_pardot_prospects(prospect_ids)
    failed_prospect_ids = []

    prospect_ids.each do |prospect_id|
      url = "#{PARDOT_PROSPECT_DELETION_URL}/#{prospect_id}"
      post_request_with_auth url
    rescue RuntimeError => e
      if e.message =~ /Pardot request failed with HTTP/
        failed_prospect_ids << prospect_id
        next
      else
        raise e
      end
    end

    failed_prospect_ids
  end

  # Perform inserts, updates and reconciliation from contact rollups into Pardot
  # @return [Hash] Hash containing number of insert and update operations performed
  def self.sync_contact_rollups_to_pardot
    # In case previous process was interrupted, first look in Pardot to see if
    # it has any Pardot IDs that we have not yet recorded on our side. This will
    # keep us from erroneously creating a new prospect when it should be an
    # update.
    update_pardot_ids_of_new_contacts

    # Handle any new contacts and create corresponding prospects in Pardot.
    num_inserts = sync_new_contacts_with_pardot

    # Retrieve Pardot IDs for newly created contacts and store them in our DB.
    # We do this as a separate pass for efficient batching of API calls to help
    # ensure we don't hit our 25K/day limit.
    update_pardot_ids_of_new_contacts

    # Handle any contact changes that should update existing prospects in
    # Pardot.
    num_updates = sync_updated_contacts_with_pardot

    {num_inserts: num_inserts, num_updates: num_updates}
  end

  # Query Pardot for recently created contacts and retrieve the Pardot-side ID
  # for that contact and store in our DB. We need Pardot's ID to be able to
  # update the contact.
  def self.update_pardot_ids_of_new_contacts
    # Find the highest Pardot ID of contacts stored in our database. Any newer
    # contacts are guaranteed to have a higher ID. (Not stated in docs, but
    # confirmed by Pardot support who said this was the best way to do this.)
    id_max = PEGASUS_DB[:contact_rollups].max(:pardot_id) || 0

    # Run repeated requests querying for prospects above our highest known
    # Pardot ID. Up to 200 prospects will be returned at a time by Pardot, so
    # query repeatedly if there are more than 200 to retrieve.
    loop do
      # Pardot request to return all prospects with ID greater than id_max.
      url = "#{PARDOT_PROSPECT_QUERY_URL}?id_greater_than=#{id_max}&fields=email,id&sort_by=id"

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
        id_max = id
        PEGASUS_DB[:contact_rollups].where(email: email).update(pardot_id: id)
      end

      log "Updated Pardot IDs in our database for #{results_in_response} contacts."

      # Stop if all the remaining results were in this response - we're done. Otherwise, keep repeating.
      break if results_in_response == total_results
    end

    # Sync robustness: handle the case where a contact has been successfully
    # created in Pardot, but we died before we were able register that fact
    # (via pardot_sync_at) in our DB. In that case, we will in a subsequent run
    # discover the pardot_id by asking for new ids via the code above. But we
    # will be missing the pardot_sync_at time so we don't know how old the data
    # is. In this corner case, set the pardot_sync_at time to the start of the
    # epoch which will force a sync of this contact from our DB.
    PEGASUS_DB[:contact_rollups].
      where(pardot_sync_at: nil).
      exclude(pardot_id: nil).
      update(pardot_sync_at: Time.utc(1970, 1, 1, 0, 0))
  end

  # Inserts newly added contacts from contact rollups into Pardot
  # @return [Integer] number of contacts inserted
  def self.sync_new_contacts_with_pardot
    # Set up config params to insert new contacts into Pardot.
    config = {
      operation_name: "insert",
      where_clause: "pardot_sync_at IS NULL AND pardot_id IS NULL AND "\
                    "opted_out IS NULL",
      pardot_url: PARDOT_BATCH_CREATE_URL
    }
    sync_contacts_with_pardot(config)
  end

  # Updates changed contacts from contact rollups into Pardot
  # @return [Integer] number of contacts updated
  def self.sync_updated_contacts_with_pardot
    # Set up config params to update existing contacts in Pardot.
    config = {
      operation_name: "update",
      where_clause: "pardot_id IS NOT NULL AND pardot_sync_at < updated_at",
      pardot_url: PARDOT_BATCH_UPDATE_URL
    }
    sync_contacts_with_pardot(config)
  end

  # Helper function to either create new Pardot prospects or update existing prospects
  # @param config [Hash] hash of config params to use to control create vs update behavior
  # @return [Integer] number of contacts inserted or updated
  def self.sync_contacts_with_pardot(config)
    log "Contact #{config[:operation_name]} pass starting."

    prospects = []
    num_operations = 0
    num_operations_last_print = 0

    # Query the contact rollups.
    PEGASUS_DB[:contact_rollups].where(config[:where_clause]).order(:id).each do |contact_rollup|
      # Skip if the email has been previously rejected by Pardot as malformed.
      # Since there are just a handful of these, it is more performant to let
      # this small number of records get returned in the results and skip them
      # rather than try to exclude them in the SQL query on a large dataset.
      next if contact_rollup[:email_malformed]

      # Map database field names and data to Pardot fields
      prospect = {}
      MYSQL_TO_PARDOT_MAP.each do |mysql_key, pardot_info|
        db_value = contact_rollup[mysql_key]
        next unless db_value.present?
        if pardot_info[:multi]
          # For multi data fields (multiselect,etc.), we set value names as
          # [fieldname]_0, [fieldname]_1, etc.
          values = db_value.split(",")
          values.each_with_index do |value, index|
            prospect["#{pardot_info[:field]}_#{index}"] = value
          end
        else
          # For single data fields, just set [fieldname] = value.
          prospect[pardot_info[:field]] = db_value
        end
      end
      # Do special handling of a few fields
      apply_special_fields(contact_rollup, prospect)

      # Add this prospect to the batch.
      prospects << prospect

      # As a sniff test, build the URL that would result from our current
      # prospect list so we can see how long it is.
      url = build_batch_prospects_url(prospects, config)

      # If the URL is longer than an empirically determined maximum safe length,
      # or if we have hit our max number of prospects allowed by Pardot in one
      # batch API call, submit the batch.
      next unless url.length > URL_LENGTH_SEND_THRESHOLD ||
        prospects.size == MAX_PROSPECT_BATCH_SIZE

      submit_prospect_batch(prospects, config)
      num_operations += prospects.length
      if num_operations > num_operations_last_print + 1000
        log "Prospect total operations so far: #{num_operations}"
        num_operations_last_print = num_operations
      end
      prospects = []
    end

    # Submit any batch remainder.
    submit_prospect_batch(prospects, config) unless prospects.empty?
    num_operations += prospects.length
    log "Contact #{config[:operation_name]} pass completed. #{num_operations} total operations."

    num_operations
  end

  # Do special transformation of some fields from database to Pardot
  # @param src [Hash] Hash of database fields we are reading from
  # @param dst [Hash] Hash of Pardot fields we are writing to
  def self.apply_special_fields(src, dest)
    # special case: if contact has opted out, set the two different Pardot
    # flavors of opted out to true. Also, only ever set this to true, otherwise
    # set no value; never set it back to false. Pardot is the authority on
    # opt-out data, so never reset any opt-out setting it has stored.
    if src[:opted_out]
      dest[:opted_out] = true
      dest[:is_do_not_email] = true
    end

    # The custom Pardot db_Opt_In field has type "Dropdown" with permitted values "Yes" or "No".
    # Explicitly check for the source opt_in field to be true or false, because nil is 'falsey'
    # and it's a little misleading to set a value for db_Opt_In in Pardot when there's no information either
    # way from the user in our database.
    dest[:db_Opt_In] = 'Yes' if src[:opt_in] == true
    dest[:db_Opt_In] = 'No' if src[:opt_in] == false

    # If this contact has a dashboard user ID (which means it is a teacher
    # account), mark that in a Pardot field so we can segment on that.
    if src[:dashboard_user_id].present?
      dest[:db_Has_Teacher_Account] = "true"
    end

    # set a custom field to mark in Pardot that this contact was imported from
    # Code Studio
    dest[:db_Imported] = "true"
  end

  # Create or update a batch of prospects. This method may raise an exception.
  # @param prospects [Array<Hash>] array of hashes of prospect data
  # @param config [Hash] hash of config params to use to control create vs update behavior
  # @return [Nokogiri::XML] XML response from Pardot
  def self.submit_prospect_batch(prospects, config)
    # Build the URL containing prospect data. Prospect data is sent as a JSON
    # blob in a query parameter.
    url = build_batch_prospects_url(prospects, config)

    # Build array of the emails to create in Pardot.
    prospect_emails = prospects.collect {|x| x["email"]}
    malformed_emails = []

    num_submitted = prospects.length

    # Post the data to create or update a batch of prospects.
    time_start = Time.now
    doc = post_with_auth_retry(url)
    time_elapsed = Time.now - time_start

    status = doc.xpath('/rsp/@stat').text

    # Look for errors within the batch and handle them individually.
    if status != "ok"
      num_removed = 0
      doc.xpath('/rsp/errors/*').each do |node|
        error_text = node.text
        if error_text == "Invalid prospect email address"
          # Identifier of contact with error is zero-based index
          prospect_identifier = node.attr("identifier").to_i
          # Adjust contact index for any we have already removed in this batch
          prospect_identifier -= num_removed

          malformed_email = prospect_emails.delete_at(prospect_identifier)
          malformed_emails << malformed_email

          log "Pardot reported email \"#{malformed_email}\" as malformed, marking as malformed in our DB"
          # Add the rejected email to our list of malformed emails

          num_removed += 1
        else
          error_text = "Unknown error" if error_text.empty?
          log doc.to_s
          log error_text
          raise "Error in Pardot response: #{error_text}"
        end
      end
    end

    prospects_per_second = num_submitted / time_elapsed
    log "Completed Pardot prospect #{config[:operation_name]} batch call. "\
        "#{num_submitted} submitted, #{prospect_emails.length} succeeded, "\
        "#{malformed_emails.length} rejected as malformed. "\
        "#{time_elapsed.round(1)} secs, #{prospects_per_second.round(1)} "\
        "prospects/sec"

    # Mark Pardot sync time of contacts in our database
    unless prospect_emails.empty?
      PEGASUS_DB[:contact_rollups].
        where("email in ?", prospect_emails).
        update(pardot_sync_at: DateTime.now)
    end
    # Mark any email addresses rejected by Pardot as malformed so we don't keep trying to fruitlessly create them forever
    unless malformed_emails.empty?
      PEGASUS_DB[:contact_rollups].
        where("email in ?", malformed_emails).
        update(email_malformed: true, pardot_sync_at: DateTime.now)
    end

    @consecutive_timeout_errors = 0

    # Pardot POST requests sometimes fail with a timeout. This happens
    # frequently enough that we can't let this be fatal for the entire process.
    # As long as we don't get too many timeouts in a row, keep going.
  rescue Net::ReadTimeout => e
    @consecutive_timeout_errors =  (@consecutive_timeout_errors || 0) + 1
    log "Pardot API request failed with Net::ReadTimeout "\
      "(#{@consecutive_timeout_errors} errors)."
    if @consecutive_timeout_errors >= 3
      log "Too many consecutive errors, halting the process."
      raise e
    end

    # This batch of inserts or updates may or may not have succeeded - we don't
    # know. For inserts, it's important that we NOT retry. If the
    # inserts did succeed on the Pardot side and we just didn't receive a
    # response, if we were to insert again that would create duplicate contacts.
    # (In practice when we get timeouts on response from an insert batch, the
    # inserts did in fact succeed.) The next time this process runs, we will
    # ask Pardot about Pardot IDs we have not recorded yet. Based on that
    # information we will retry any failed inserts as part of the normal
    # process.
    log "Continuing process. Prospects from batch with timed out response "\
        "are in an indeterminate state and will be reconciled on the next "\
        "process run."
  end

  # Login to Pardot and request an API key. The API key is valid for (up to) one
  # hour, after which it will become invalid and we will need to request a new
  # one.
  # @return [String] API key to use for subsequent requests
  def self.request_pardot_api_key
    log "Requesting new API key"
    doc = post_request(
      PARDOT_AUTHENTICATION_URL,
      {
        email: CDO.pardot_username,
        password: CDO.pardot_password,
        user_key: CDO.pardot_user_key
      }
    )

    status = doc.xpath('/rsp/@stat').text
    if status != "ok"
      raise "Pardot authentication response failed with status #{status}  #{doc}"
    end

    api_key = doc.xpath('/rsp/api_key').text
    raise "Pardot authentication response did not include api_key" if api_key.nil?

    $pardot_api_key = api_key
  end

  # Build the URL for a batch prospect operation in Pardot. The prospect data
  # becomes a JSON blob in the query param.
  # @param prospects [Array<Hash>] array of hashes of prospect data
  # @param config [Hash] hash of config params to use to control create vs
  #   update behavior
  # @return [String] Pardot URL for API request including encoded JSON prospect
  #   data in query string
  def self.build_batch_prospects_url(prospects, config)
    prospects_payload_json_encoded = URI.encode({prospects: prospects}.to_json)
    # We also need to encode plus signs in email addresses, otherwise Pardot
    # rejects them as invalid. URI.encode does not encode plus signs, as they
    # are valid characters in the base of a URL. Although they are NOT valid in
    # the query string, which is where this data is going.
    prospects_payload_json_encoded = prospects_payload_json_encoded.
      gsub("+", "%2B")

    "#{config[:pardot_url]}?prospects=#{prospects_payload_json_encoded}"
  end

  # Make an API request with Pardot authentication, including appending auth
  # params and refreshing Pardot API key and retrying if necessary.
  # @param url [String] URL to post to
  # @return [Nokogiri::XML, nil] XML response from Pardot
  def self.post_with_auth_retry(url)
    # do the post to Pardot
    post_request_with_auth(url)
  rescue InvalidApiKeyException
    # If we fail with an invalid key, that probably means our API key (which is
    # good for one hour) has expired. Try one time to request a new API key and
    # try the post again. If that fails, that is a fatal error.
    request_pardot_api_key
    post_request_with_auth(url)
  end

  # Make an API request with Pardot authentication
  # @param url [String] URL to post to. The URL passed in should not contain
  #   auth params, as auth params will get appended in this method.
  # @return [Nokogiri::XML] XML response from Pardot
  def self.post_request_with_auth(url)
    request_pardot_api_key if $pardot_api_key.nil?
    # add the API key and user key parameters to the URL
    auth_url = append_auth_params_to_url(url)
    post_request(auth_url, {})
  end

  # Make an API request. This method may raise exceptions.
  # @param url [String] URL to post to - must already include Pardot auth params
  #   in query string
  # @param params [Hash] hash of POST params (may be empty hash)
  # @return [Nokogiri::XML, nil] XML response from Pardot
  def self.post_request(url, params)
    uri = URI(url)

    response = Net::HTTP.post_form(uri, params)

    # Do common error handling for Pardot response.
    unless PARDOT_SUCCESS_HTTP_CODES.include?(response.code)
      raise "Pardot request failed with HTTP #{response.code}"
    end

    if response.code == '204'
      return nil
    end

    doc = Nokogiri::XML(response.body, &:noblanks)
    raise "Pardot response did not return parsable XML" if doc.nil?

    error_details = doc.xpath('/rsp/err').text
    raise InvalidApiKeyException if error_details.include? "Invalid API key or user key"

    status = doc.xpath('/rsp/@stat').text
    raise "Pardot response did not include status" if status.nil?

    doc
  end

  # Append standard Pardot auth parameters (per-session API key and fixed user
  # key) to a Pardot API request
  # @param url [String] URL to post to
  # @return [String] URL with auth parameters appended
  def self.append_auth_params_to_url(url)
    "#{url}&api_key=#{$pardot_api_key}&user_key=#{CDO.pardot_user_key}"
  end

  # Parse a Pardot XML response and raise an exception on the first error
  # if there is one.
  # @param doc [Nokogiri::XML] XML response from Pardot
  def self.raise_if_response_error(doc)
    status = doc.xpath('/rsp/@stat').text
    if status != "ok"
      error_text = doc.xpath('/rsp/errors/*').first.try(:text)
      error_text = "Unknown error" if error_text.nil? || error_text.empty?
      log doc.to_s
      log error_text
      raise "Error in Pardot response: #{error_text}"
    end
  end

  def self.log(s)
    # puts s
    CDO.log.info s
  end
end
