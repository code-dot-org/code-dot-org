module Pd::Payment
  # Payment model for district workshops.
  class PaymentCalculatorDistrict < PaymentCalculatorBase
    FOOD_PAYMENT_PER_TEACHER_PER_DAY = 40
    PAYMENT_PER_FACILITATOR_PER_DAY = 500

    protected

    # Calculates payment amounts.
    # @param payment [Payment] calculated workshop details that go into payment amount calculation.
    # @return [Hash{String => Numeric}] Map of payment parts (e.g. :food) to their dollar amounts.
    def calculate_payment_amounts(payment)
      {
        food: FOOD_PAYMENT_PER_TEACHER_PER_DAY * payment.total_teacher_attendance_days,
        facilitator: PAYMENT_PER_FACILITATOR_PER_DAY * payment.workshop.facilitators.count * payment.num_days
      }
    end
  end
end
