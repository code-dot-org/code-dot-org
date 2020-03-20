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

class ContactRollupsPardotMemory < ApplicationRecord
  self.table_name = 'contact_rollups_pardot_memory'
end
