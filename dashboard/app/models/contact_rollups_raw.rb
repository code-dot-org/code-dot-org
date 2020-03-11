# == Schema Information
#
# Table name: contact_rollups_raw
#
#  id              :integer          not null, primary key
#  email           :string(255)      not null
#  sources         :string(255)      not null
#  data            :json
#  data_updated_at :datetime         not null
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#
# Indexes
#
#  index_contact_rollups_raw_on_email_and_sources  (email,sources) UNIQUE
#

class ContactRollupsRaw < ApplicationRecord
  self.table_name = 'contact_rollups_raw'
end
