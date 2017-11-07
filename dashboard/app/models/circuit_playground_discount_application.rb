# == Schema Information
#
# Table name: circuit_playground_discount_applications
#
#  id                                  :integer          not null, primary key
#  user_id                             :integer          not null
#  unit_6_intention                    :integer
#  has_confirmed_school                :boolean          default(FALSE), not null
#  full_discount                       :boolean
#  admin_set_status                    :boolean          default(FALSE), not null
#  signature                           :string(255)
#  signed_at                           :datetime
#  circuit_playground_discount_code_id :integer
#  created_at                          :datetime         not null
#  updated_at                          :datetime         not null
#
# Indexes
#
#  index_circuit_playground_applications_on_code_id           (circuit_playground_discount_code_id)
#  index_circuit_playground_discount_applications_on_user_id  (user_id)
#

class CircuitPlaygroundDiscountApplication < ApplicationRecord
  belongs_to :user
  has_one :circuit_playground_discount_code
end
