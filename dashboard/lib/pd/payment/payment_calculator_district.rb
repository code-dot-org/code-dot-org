module Pd::Payment
  # Payment model for district workshops.
  class PaymentCalculatorDistrict < PaymentCalculatorBase
    FOOD_PAYMENT_PER_TEACHER_PER_DAY = 40
    PAYMENT_PER_FACILITATOR_PER_DAY = 500

    protected

    # Calculates payment amounts.
    # @param workshop_summary [WorkshopSummary] calculated workshop details that go into payment amount calculation.
    # @return [Hash{String => Numeric}] Map of payment parts (e.g. :food) to their dollar amounts.
    def calculate_payment_amounts(workshop_summary)
      {
        food: FOOD_PAYMENT_PER_TEACHER_PER_DAY * workshop_summary.total_teacher_attendance_days,
        facilitator: PAYMENT_PER_FACILITATOR_PER_DAY * workshop_summary.workshop.facilitators.count * workshop_summary.num_days
      }
    end
  end
end
