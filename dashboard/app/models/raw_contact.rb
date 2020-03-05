# == Schema Information
#
# Table name: raw_contacts
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
#  index_raw_contacts_on_email_and_sources  (email,sources) UNIQUE
#

class RawContact < ApplicationRecord
  validates :sources, uniqueness: {scope: :email}
end
