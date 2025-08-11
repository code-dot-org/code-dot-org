# == Schema Information
#
# Table name: notifications
#
#  id                :bigint           not null, primary key
#  user_id           :integer          not null
#  external_id       :string(255)
#  title             :string(255)
#  description       :text(65535)
#  notification_type :string(255)
#  read_at           :datetime
#  is_dismissed      :boolean          default(FALSE), not null
#  link_url          :string(255)
#  ai_prompts        :json
#  icon_name         :string(255)
#  expires_at        :datetime
#  priority          :integer          default(0), not null
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#
# Indexes
#
#  index_notifications_on_user_id_and_created_at              (user_id,created_at)
#  index_notifications_on_user_id_and_read_at_and_expires_at  (user_id,read_at,expires_at)
#
class Notification < ApplicationRecord
  belongs_to :user

  validates :priority, presence: true, numericality: {greater_than_or_equal_to: 0}

  scope :not_dismissed, -> {where(is_dismissed: false)}
  scope :not_expired, -> {where('expires_at IS NULL OR expires_at > ?', Time.current)}
  scope :active, -> {not_dismissed.not_expired}

  def read?
    read_at.present?
  end

  def expired?
    expires_at.present? && expires_at < Time.current
  end
end
