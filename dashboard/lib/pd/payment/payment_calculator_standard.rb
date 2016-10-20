module Pd::Payment
  # Standard payment model for most public/private workshops.
  class PaymentCalculatorStandard < PaymentCalculatorBase
    PLP_URBAN_MULTIPLIER = 1.25
    PAYMENT_PER_TEACHER_PER_DAY = 40
    PAYMENT_PER_FACILITATOR_PER_DAY = 500
    PAYMENT_STAFFER_PER_DAY = 250
    VENUE_SIZE_TEACHER_THRESHOLD = 10
    PAYMENT_VENUE_SMALL_PER_DAY = 400
    PAYMENT_VENUE_LARGE_PER_DAY = 450

    protected

    # Calculates payment amounts.
    # @param workshop_summary [WorkshopSummary] calculated workshop details that go into payment amount calculation.
    # @return [Hash{String => Numeric}] Map of payment parts (e.g. :food) to their dollar amounts.
    def calculate_payment_amounts(workshop_summary)
      plp_multiplier = workshop_summary.plp && workshop_summary.plp.urban? ? PLP_URBAN_MULTIPLIER : 1

      venue_payment_per_day = workshop_summary.num_qualified_teachers > VENUE_SIZE_TEACHER_THRESHOLD ?
        PAYMENT_VENUE_LARGE_PER_DAY : PAYMENT_VENUE_SMALL_PER_DAY

      {
        food: PAYMENT_PER_TEACHER_PER_DAY * workshop_summary.total_teacher_attendance_days * plp_multiplier,
        facilitator: PAYMENT_PER_FACILITATOR_PER_DAY * workshop_summary.workshop.facilitators.count * workshop_summary.num_days,
        staffer: PAYMENT_STAFFER_PER_DAY * workshop_summary.num_days * plp_multiplier,
        venue: venue_payment_per_day * workshop_summary.num_days * plp_multiplier
      }
    end
  end
end
