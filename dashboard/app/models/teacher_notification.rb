# == Schema Information
#
# Table name: teacher_notifications
#
#  id           :bigint           not null, primary key
#  user_id      :integer          not null
#  external_id  :string(255)
#  title        :string(255)      not null
#  description  :text(65535)      not null
#  icon_name    :string(255)
#  icon_color   :string(255)
#  href_links   :json
#  ai_prompts   :json
#  priority     :integer          default(0)
#  published_at :datetime
#  expires_at   :datetime
#  read_at      :datetime
#  is_dismissed :boolean          default(FALSE), not null
#  created_at   :datetime         not null
#  updated_at   :datetime         not null
#
# Indexes
#
#  index_teacher_notifications_on_user_id_and_created_at    (user_id,created_at)
#  index_teacher_notifications_on_user_id_and_is_dismissed  (user_id,is_dismissed)
#  index_teacher_notifications_on_user_id_and_read_at       (user_id,read_at)
#
class TeacherNotification < ApplicationRecord
  belongs_to :user

  scope :not_dismissed, -> {where(is_dismissed: false)}
  scope :not_expired, -> {where('expires_at IS NULL OR expires_at > ?', Time.current)}
  scope :published, -> {where('published_at IS NULL OR published_at <= ?', Time.current)}
  scope :active, -> {not_dismissed.not_expired.published}

  validates :title, presence: true
  validates :description, presence: true

  def read?
    read_at.present?
  end

  def expired?
    expires_at.present? && expires_at < Time.current
  end

  def published?
    published_at.nil? || published_at <= Time.current
  end

  def active?
    !is_dismissed && !expired? && published?
  end

  def mark_as_read!
    update!(read_at: Time.current) unless read?
  end
end
