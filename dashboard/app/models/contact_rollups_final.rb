# == Schema Information
#
# Table name: contact_rollups_final
#
#  id         :integer          not null, primary key
#  email      :string(255)      not null
#  data       :json             not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_contact_rollups_final_on_email  (email) UNIQUE
#

class ContactRollupsFinal < ApplicationRecord
  self.table_name = 'contact_rollups_final'
end
