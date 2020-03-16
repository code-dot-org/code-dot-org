# == Schema Information
#
# Table name: contact_rollups_pardot_memory
#
#  id                   :integer          not null, primary key
#  email                :string(255)      not null
#  pardot_id            :integer
#  pardot_id_updated_at :datetime
#  data_synced          :json
#  data_synced_at       :datetime
#  data_rejected_at     :datetime
#  data_rejected_reason :string(255)
#  created_at           :datetime         not null
#  updated_at           :datetime         not null
#
# Indexes
#
#  index_contact_rollups_pardot_memory_on_email      (email) UNIQUE
#  index_contact_rollups_pardot_memory_on_pardot_id  (pardot_id) UNIQUE
#

require 'cdo/pardot'

class ContactRollupsPardotMemory < ApplicationRecord
  self.table_name = 'contact_rollups_pardot_memory'

  def self.update_from_new_contacts
    # Find the highest Pardot ID of contacts stored in our database. Any newer
    # contacts are guaranteed to have a higher ID. (Not stated in docs, but
    # confirmed by Pardot support who said this was the best way to do this.)
    # id_max = maximum(:pardot_id) || 0
    id_max = 82_574_936

    # Run repeated requests querying for prospects above our highest known
    # Pardot ID. Up to 200 prospects will be returned at a time by Pardot, so
    # query repeatedly if there are more than 200 to retrieve.
    loop do
      # Pardot request to return all prospects with ID greater than id_max.
      url = "#{Pardot::PARDOT_PROSPECT_QUERY_URL}?id_greater_than=#{id_max}&fields=email,id&sort_by=id"

      doc = Pardot.post_with_auth_retry(url)
      Pardot.raise_if_response_error(doc)

      # Pardot returns the count total available prospects (not capped to 200),
      # although the data for a max of 200 are contained in the response.
      total_results = doc.xpath('/rsp/result/total_results').text.to_i
      results_in_response = 0

      pp doc.xpath('/rsp/result/prospect')

      # Process every prospect in the response.
      doc.xpath('/rsp/result/prospect').each do |node|
        id = node.xpath("id").text.to_i
        email = node.xpath("email").text
        results_in_response += 1
        id_max = id

        pardot_memory = find_or_initialize_by(email: email)
        pardot_memory.pardot_id = id
        pardot_memory.save
      end

      puts "Updated Pardot IDs in our database for #{results_in_response} contacts."

      # Stop if all the remaining results were in this response - we're done. Otherwise, keep repeating.
      break if results_in_response == total_results
    end
  end
end
