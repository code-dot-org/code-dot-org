module Pd::Payment
  class WorkshopPayment
    attr_accessor :workshop, :pay_period, :num_days, :num_hours, :min_attendance_days

    # @return [Array<SessionAttendanceSummary>] One per session.
    # This does not take into account min attendance or max sessions.
    attr_accessor :session_attendance_summaries

    # @return [Hash{Integer => TeacherAttendanceTotal}] map of teacher id to raw attendance totals for that teacher.
    attr_accessor :raw_teacher_attendance

    # @return [Hash{Integer => TeacherAttendanceTotal}] map of teacher id to adjusted attendance totals for that teacher.
    attr_accessor :adjusted_teacher_attendance

    # @return [Integer] Total adjusted days attended by all qualified teachers (one per teacher per day).
    attr_accessor :total_teacher_attendance_days

    # @return [Boolean] whether the workshop is qualified for payment.
    attr_accessor :qualified

    # @return [String] payment type
    attr_accessor :payment_type

    # @return [Hash{String => Numeric}] Map of payment parts (e.g. :food) to their dollar amounts.
    attr_accessor :payment_amounts

    # @return [Numeric] Sum of all payment parts.
    attr_accessor :payment_total

    def section_url
      CDO.code_org_url("/teacher-dashboard#/sections/#{workshop.section.id}", 'http:')
    end

    def workshop_url
      CDO.studio_url("pd/workshop_dashboard/workshops/#{workshop.id}", 'http:')
    end

    def num_teachers
      raw_teacher_attendance.count
    end

    def num_qualified_teachers
      adjusted_teacher_attendance.count
    end

    def plp
      workshop.professional_learning_partner
    end

    def attendance_count_per_session
      session_attendance_summaries.map(&:teacher_ids).map(&:count)
    end
  end
end
