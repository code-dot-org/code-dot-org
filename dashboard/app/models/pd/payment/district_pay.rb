module Pd::Payment
  # Payment model for district workshops.
  class DistrictPay < BasePay
    PAYMENT_PER_TEACHER_PER_DAY = 40
    PAYMENT_PER_FACILITATOR_PER_DAY = 500

    protected

    def calculate_payment
      {
        food: PAYMENT_PER_TEACHER_PER_DAY * @total_teacher_attendance_days,
        facilitator: PAYMENT_PER_FACILITATOR_PER_DAY * @workshop.facilitators.count * @num_days
      }
    end
  end
end
