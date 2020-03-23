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

require 'cdo/contact_rollups/v2/pardot'

class ContactRollupsPardotMemory < ApplicationRecord
  self.table_name = 'contact_rollups_pardot_memory'

  def self.add_and_update_pardot_ids(last_id = nil)
    last_id ||= ContactRollupsPardotMemory.maximum(:pardot_id) || 0

    # TODO: bulk insert and update. or even bulk delete and then bulk insert
    Pardot.retrieve_new_ids(last_id).each do |mapping|
      pardot_record = find_or_initialize_by(email: mapping[:email])
      pardot_record.pardot_id = mapping[:id]
      pardot_record.pardot_id_updated_at = Time.now
      pardot_record.save
    end
  end
end
