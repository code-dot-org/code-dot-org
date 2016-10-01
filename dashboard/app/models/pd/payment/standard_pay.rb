module Pd::Payment
  # Standard payment model for most public/private workshops.
  class StandardPay < BasePay
    PLP_URBAN_MULTIPLIER = 1.25
    PAYMENT_PER_TEACHER_PER_DAY = 40
    PAYMENT_PER_FACILITATOR_PER_DAY = 500
    PAYMENT_STAFFER_PER_DAY = 250
    VENUE_SIZE_TEACHER_THRESHOLD = 10
    PAYMENT_VENUE_SMALL_PER_DAY = 400
    PAYMENT_VENUE_LARGE_PER_DAY = 450

    attr_reader :venue_payment_per_day, :plp_multiplier

    protected

    def calculate_payment
      @plp_multiplier = @plp && @plp.urban? ? PLP_URBAN_MULTIPLIER : 1

      @venue_payment_per_day = self.num_qualified_teachers > VENUE_SIZE_TEACHER_THRESHOLD ?
        PAYMENT_VENUE_LARGE_PER_DAY : PAYMENT_VENUE_SMALL_PER_DAY

      {
        food: PAYMENT_PER_TEACHER_PER_DAY * @total_teacher_attendance_days * @plp_multiplier,
        facilitator: PAYMENT_PER_FACILITATOR_PER_DAY * @workshop.facilitators.count * @num_days,
        staffer: PAYMENT_STAFFER_PER_DAY * @num_days * @plp_multiplier,
        venue: @venue_payment_per_day * @num_days * @plp_multiplier
      }
    end
  end
end
