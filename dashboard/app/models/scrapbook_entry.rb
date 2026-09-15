# == Schema Information
#
# Table name: scrapbook_entries
#
#  id               :bigint           not null, primary key
#  user_id          :integer          not null
#  script_id        :integer
#  level_id         :integer
#  channel_id       :string(255)
#  before_asset_url :string(255)
#  after_asset_url  :string(255)
#  entry_text       :text(65535)
#  created_at       :datetime         not null
#  updated_at       :datetime         not null
#
# Indexes
#
#  index_scrapbook_entries_on_user_id                             (user_id)
#  index_scrapbook_entries_on_user_id_and_channel_id              (user_id,channel_id) UNIQUE
#  index_scrapbook_entries_on_user_id_and_script_id_and_level_id  (user_id,script_id,level_id) UNIQUE
#
class ScrapbookEntry < ApplicationRecord
  STEM_TEXT_MAX = 500

  belongs_to :user

  # An entry is keyed either by (script_id, level_id) for in-curriculum levels,
  # or by channel_id for standalone projects. Exactly one of those keyings must
  # be present.
  serialize :entry_text, JSON

  validate :keyed_by_script_level_or_channel
  validates :user_id, uniqueness: {scope: [:script_id, :level_id]}, if: -> {channel_id.blank?}
  validates :user_id, uniqueness: {scope: :channel_id}, if: -> {channel_id.present?}
  validate :entry_text_values_within_limit

  # The asset columns hold a bare S3 filename (see Scrapbook::ImageStore). Reject
  # anything else so a stored value can never escape the user's prefix when it is
  # used to build an S3 key in the serving path.
  validates :before_asset_url, format: {with: Scrapbook::ImageStore::FILENAME_PATTERN}, allow_blank: true
  validates :after_asset_url, format: {with: Scrapbook::ImageStore::FILENAME_PATTERN}, allow_blank: true

  # Best-effort S3 cleanup: an orphaned image wastes space but is otherwise
  # harmless, so a failed delete must not block the DB write.
  before_update :delete_replaced_images
  after_destroy :delete_all_images

  private def keyed_by_script_level_or_channel
    has_script_level = script_id.present? && level_id.present?
    has_channel = channel_id.present?
    if has_script_level && has_channel
      errors.add(:base, 'entry cannot have both script/level and channel_id')
    elsif !has_script_level && !has_channel
      errors.add(:base, 'entry must have script_id+level_id or channel_id')
    end
  end

  private def entry_text_values_within_limit
    return if entry_text.blank?
    unless entry_text.is_a?(Hash)
      errors.add(:entry_text, 'must be a hash of stem keys to text values')
      return
    end
    entry_text.each do |key, value|
      next if value.blank?
      unless value.is_a?(String)
        errors.add(:entry_text, "value for #{key} must be a string")
        next
      end
      if value.length > STEM_TEXT_MAX
        errors.add(:entry_text, "value for #{key} exceeds #{STEM_TEXT_MAX} characters")
      end
    end
  end

  private def delete_replaced_images
    delete_image(before_asset_url_was) if before_asset_url_changed? && before_asset_url_was.present?
    delete_image(after_asset_url_was) if after_asset_url_changed? && after_asset_url_was.present?
  end

  private def delete_all_images
    delete_image(before_asset_url)
    delete_image(after_asset_url)
  end

  private def delete_image(filename)
    return if filename.blank?
    Scrapbook::ImageStore.delete(user_id, filename)
  rescue StandardError => exception
    Rails.logger.warn("scrapbook image cleanup failed for user #{user_id}: #{exception.message}")
  end
end
