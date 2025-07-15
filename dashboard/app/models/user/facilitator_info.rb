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
  belongs_to :user

  validate :validate_user_is_facilitator, if: :user_id_changed?

  private def validate_user_is_facilitator
    errors.add(:user, :not_facilitator) unless user&.facilitator?
  end
end
