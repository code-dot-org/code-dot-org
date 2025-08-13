# == Schema Information
#
# Table name: external_notifications
#
#  id           :bigint           not null, primary key
#  user_id      :integer          not null
#  external_id  :string(255)      not null
#  read_at      :datetime
#  is_dismissed :boolean          default(FALSE), not null
#  created_at   :datetime         not null
#  updated_at   :datetime         not null
#
# Indexes
#
#  index_external_notifications_on_user_id_and_created_at  (user_id,created_at)
#  index_external_notifications_on_user_id_and_read_at     (user_id,read_at)
#
class ExternalNotification < ApplicationRecord
  belongs_to :user

  scope :not_dismissed, -> {where(is_dismissed: false)}

  def read?
    read_at.present?
  end
end
