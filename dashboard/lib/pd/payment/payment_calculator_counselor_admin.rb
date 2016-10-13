module Pd::Payment
  # Payment model for counselor and admin workshops.
  class PaymentCalculatorCounselorAdmin < PaymentCalculatorBase
    PLP_URBAN_MULTIPLIER = 1.25
    FOOD_PAYMENT_PER_TEACHER_PER_DAY = 20
    STAFFER_PAYMENT_PER_DAY = 250
    VENUE_PAYMENT_PER_DAY = 400

    protected

    # Calculates payment amounts.
    # @param payment [Payment] calculated workshop details that go into payment amount calculation.
    # @return [Hash{String => Numeric}] Map of payment parts (e.g. :food) to their dollar amounts.
    def calculate_payment_amounts(payment)
      plp_multiplier = payment.plp && payment.plp.urban? ? PLP_URBAN_MULTIPLIER : 1

      {
        food: FOOD_PAYMENT_PER_TEACHER_PER_DAY * payment.total_teacher_attendance_days * plp_multiplier,
        staffer: STAFFER_PAYMENT_PER_DAY * payment.num_days * plp_multiplier,
        venue: VENUE_PAYMENT_PER_DAY * payment.num_days * plp_multiplier
      }
    end
  end
end
