# == Schema Information
#
# Table name: user_data_retention_statuses
#
#  id                             :bigint           not null, primary key
#  user_id                        :integer          not null
#  pii_scrubbed_at                :datetime
#  anonymized_at                  :datetime
#  created_at                     :datetime         not null
#  updated_at                     :datetime         not null
#  deletion_warning_email_sent_at :datetime
#
# Indexes
#
#  index_user_data_retention_statuses_on_anonymized_at          (anonymized_at)
#  index_user_data_retention_statuses_on_pii_scrubbed_at        (pii_scrubbed_at)
#  index_user_data_retention_statuses_on_user_id                (user_id)
#  index_user_data_retention_statuses_on_warning_email_sent_at  (deletion_warning_email_sent_at)
#
class User::DataRetentionStatus < ApplicationRecord
  belongs_to :user, -> {with_deleted}
end
