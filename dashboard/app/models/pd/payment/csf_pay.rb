module Pd::Payment
  # Payment model for public/private CSF workshops.
  class CSFPay < BasePay
    PAY_PER_QUALIFIED_TEACHER = 50

    def payment_type
      'CSF Facilitator'
    end

    # CSF workshops are always qualified for payment.
    def qualified?
      true
    end

    protected

    # CSF workshops have different attendance rules. Workshops are always exactly one day (session),
    # and every teacher in the section counts but only those who have solved >= 10 puzzles is qualified (see #teacher_qualified?)
    # Sets the following member variables:
    #   @attendance_count_per_session - array of attendance count per session, with min/max days applied.
    #   @raw_attendance_days_per_teacher - hash of teacher_id to the raw number of days attended.
    #   @raw_attendance_hours_per_teacher - hash of teacher_id to the raw number of hours attended.
    def calculate_raw_attendance
      # Anyone in the section counts as attended for CSF
      @attendance_count_per_session = [@workshop.section.students.count]

      # Exactly one day for everyone in the section.
      @raw_attendance_days_per_teacher = @workshop.section.students.map{|s| [s.id, 1]}.to_h

      # CSF workshops don't care about hours.
      @raw_attendance_hours_per_teacher = @workshop.section.students.map{|s| [s.id, 0]}.to_h
    end

    # Teachers must complete >= 10 puzzles to qualify.
    def teacher_qualified?(teacher_id)
      UserLevel.where(user_id: teacher_id).passing.count >= 10
    end

    def calculate_payment
      {
        food: num_qualified_teachers * PAY_PER_QUALIFIED_TEACHER
      }
    end
  end
end
