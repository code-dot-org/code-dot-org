require_relative 'pardot_helpers'

class PardotV2
  extend PardotHelpers

  PARDOT_API_V4_BASE = "https://pi.pardot.com/api/prospect/version/4".freeze
  PARDOT_PROSPECT_QUERY_URL = "#{PARDOT_API_V4_BASE}/do/query".freeze

  # Retrieves new email-id mappings from Pardot
  # @param [Integer] last_id
  # @return [Array] an array of hash {email, id}
  def self.retrieve_new_ids(last_id = 0)
    # Run repeated requests querying for prospects above our highest known
    # Pardot ID. Up to 200 prospects will be returned at a time by Pardot, so
    # query repeatedly if there are more than 200 to retrieve.
    mappings = []

    loop do
      # Pardot request to return all prospects with ID greater than the last id.
      url = "#{PARDOT_PROSPECT_QUERY_URL}?id_greater_than=#{last_id}&fields=email,id&sort_by=id"
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
end
