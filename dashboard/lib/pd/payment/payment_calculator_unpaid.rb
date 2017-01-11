module Pd::Payment
  # Calculator for unpaid workshops. This generates a summary with no payment.
  class PaymentCalculatorUnpaid < PaymentCalculatorBase
    protected

    # Unpaid workshops are never qualified for payment.
    # @param total_teacher_attendance_days [Integer] total number of teacher days attended.
    # @return [Boolean] whether or not the workshop is qualified for payment.
    def qualified?(total_teacher_attendance_days)
      nil
    end
  end
end
