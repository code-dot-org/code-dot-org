# == Schema Information
#
# Table name: parental_permission_requests
#
#  id             :bigint           not null, primary key
#  user_id        :integer          not null
#  parent_email   :string(255)      not null
#  uuid           :string(36)       not null
#  reminders_sent :integer          default(0), not null
#  resends_sent   :integer          default(0), not null
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
#
# Indexes
#
#  index_parental_permission_requests_on_user_id  (user_id)
#  index_parental_permission_requests_on_uuid     (uuid)
#
class ParentalPermissionRequest < ApplicationRecord
  belongs_to :user
  validates :parent_email, presence: true

  before_create :set_uuid

  after_create :log_cap_event

  def set_uuid
    self.uuid = SecureRandom.uuid
  end

  private def log_cap_event
    if ParentalPermissionRequest.where(user: user).limit(2).count > 1
      Services::ChildAccount::EventLogger.log_parent_email_update(user)
    else
      Services::ChildAccount::EventLogger.log_parent_email_submit(user)
    end
  end
end
