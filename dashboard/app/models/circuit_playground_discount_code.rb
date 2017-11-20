# == Schema Information
#
# Table name: circuit_playground_discount_codes
#
#  id               :integer          not null, primary key
#  code             :string(255)      not null
#  partial_discount :boolean          not null
#  expiration       :datetime         not null
#  claimed_at       :datetime
#  voided_at        :datetime
#  created_at       :datetime         not null
#  updated_at       :datetime         not null
#

class CircuitPlaygroundDiscountCode < ApplicationRecord
end
