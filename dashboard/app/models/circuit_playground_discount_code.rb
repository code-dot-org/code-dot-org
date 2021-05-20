# == Schema Information
#
# Table name: circuit_playground_discount_codes
#
#  id            :integer          not null, primary key
#  code          :string(255)      not null
#  full_discount :boolean          not null
#  expiration    :datetime         not null
#  claimed_at    :datetime
#  voided_at     :datetime
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#

class CircuitPlaygroundDiscountCode < ApplicationRecord
  # We'll notify honeybadger when we request a full/partial discount and there
  # are fewer than this many available (so that we can add more).
  WARN_COUNT = 25

  # Claims the next available code of the given discount amount (full/partial)
  # and returns the code.
  def self.claim(full_discount)
    expiration_field = arel_table[:expiration]

    code = nil
    Retryable.retryable(on: ActiveRecord::RecordNotSaved) do
      codes = where(full_discount: full_discount).
        where(claimed_at: nil).
        where(voided_at: nil).
        where(expiration_field.gt(Time.now)).
        limit(WARN_COUNT)

      if codes.count < WARN_COUNT
        Honeybadger.notify(
          error_message: "Fewer than #{WARN_COUNT} remaining circuit playground discount codes",
          error_class: "CircuitPlaygroundDiscountCode.limited_codes_left",
          context: {
            full_discount: full_discount,
            count: codes.length
          }
        )
      end
      code = codes.first

      if code
        # We use update_all so that the where/update are done in a single SQL query
        count = where({id: code.id, claimed_at: nil}).update_all(claimed_at: Time.now)
        raise ActiveRecord::RecordNotSaved unless count == 1
        code.reload
      end
    end
    code
  end
end
