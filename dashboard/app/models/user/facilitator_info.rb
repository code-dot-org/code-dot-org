# frozen_string_literal: true

# == Schema Information
#
# Table name: user_facilitator_infos
#
#  id         :bigint           not null, primary key
#  user_id    :integer          not null
#  bio        :text(65535)
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_user_facilitator_infos_on_user_id  (user_id)
#
class User::FacilitatorInfo < ApplicationRecord
  BIO_MIN_LENGTH = 24
  BIO_MAX_LENGTH = 500

  belongs_to :user, inverse_of: :facilitator_info

  auto_strip_attributes :bio

  validates :bio, length: BIO_MIN_LENGTH..BIO_MAX_LENGTH, allow_blank: true, if: :bio_changed?
  validate :user_is_facilitator, if: :user_id_changed?
  validate :bio_has_no_profanity, if: :bio_changed?

  private def user_is_facilitator
    errors.add(:user, :not_facilitator) unless user&.facilitator?
  end

  private def bio_has_no_profanity
    return if bio.blank? || errors.present?
    errors.add(:bio, :has_profanity) if ProfanityFilter.find_potential_profanity(bio, I18n.locale.to_s)
  end
end
