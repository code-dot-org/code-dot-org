# == Schema Information
#
# Table name: data_retention_statuses
#
#  id              :bigint           not null, primary key
#  user_id         :integer          not null
#  pii_scrubbed_at :datetime
#  anonymized_at   :datetime
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#
# Indexes
#
#  index_data_retention_statuses_on_anonymized_at    (anonymized_at)
#  index_data_retention_statuses_on_pii_scrubbed_at  (pii_scrubbed_at)
#  index_data_retention_statuses_on_user_id          (user_id)
#
module DataRetention
  class Status < ApplicationRecord
    belongs_to :user
  end
end
