# frozen_string_literal: true

module Teacher::Facilitatable
  extend ActiveSupport::Concern

  included do
    has_one :facilitator_info, class_name: 'User::FacilitatorInfo', foreign_key: :user_id, dependent: :destroy

    # Defines +facilitator_bio+ method to access the bio of the facilitator info
    delegate :bio, to: :facilitator_info, prefix: :facilitator, allow_nil: true
  end
end
