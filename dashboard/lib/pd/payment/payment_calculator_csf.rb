module Pd::Payment
  # Payment model for public/private CSF workshops.
  class PaymentCalculatorCSF < PaymentCalculatorBase
    PAY_PER_QUALIFIED_TEACHER = 50

    private

    # Determines the payment type.
    # @param workshop [Pd::Workshop]
    # @return [String] payment type: always 'CSF Facilitator'
    def get_payment_type(_workshop)
      'CSF Facilitator'
    end

    # Is the workshop qualified for payment?
    # CSF workshops are always qualified for payment.
    # @param total_teacher_attendance_days [Integer] total number of teacher days attended.
    # @return [true]
    def qualified?(_total_teacher_attendance_days)
      true
    end

    # Gets session attendance summaries for a workshop.
    # CSF workshops have different attendance rules. Workshops are always exactly one day (session),
    # and every teacher in the section counts but only those who have solved >= 10 puzzles are qualified (see #teacher_qualified?)
    # @param workshop [Pd::Workshop]
    # @return [Array<SessionAttendanceSummary>] summary of attendance for each session.
    def get_session_attendance_summaries(workshop)
      # Anyone in the section counts as attended for CSF
      teacher_ids = workshop.section.students.pluck :id

      # Return exactly one session (day), with the raw hours from the session.
      [SessionAttendanceSummary.new(workshop.sessions.first.hours, teacher_ids)]
    end

    # Teachers must complete >= 10 puzzles to qualify.
    # @param teacher [User]
    # @return [Boolean] whether or not the teacher is qualified for payment.
    def teacher_qualified?(teacher)
      UserLevel.where(user_id: teacher.id).passing.count >= 10
    end

    # Calculates payment amounts.
    # @param workshop_summary [WorkshopSummary] calculated workshop details that go into payment amount calculation.
    # @return [Hash{String => Numeric}] Map of payment parts (e.g. :food) to their dollar amounts.
    def calculate_payment_amounts(workshop_summary)
      {
        food: workshop_summary.num_qualified_teachers * PAY_PER_QUALIFIED_TEACHER
      }
    end
  end
end
