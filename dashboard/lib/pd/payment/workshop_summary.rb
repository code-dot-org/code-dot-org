module Pd::Payment
  class WorkshopSummary
    attr_accessor :workshop, :pay_period, :num_days, :num_hours, :min_attendance_days

    # @return [Class] calculator class that was used to calculate this payment.
    attr_accessor :calculator_class

    # @return [Array<SessionAttendanceSummary>] One per session.
    # This does not take into account min attendance or max sessions.
    attr_accessor :session_attendance_summaries

    # @return [Integer] Total adjusted days attended by all qualified teachers (one per teacher per day).
    attr_accessor :total_teacher_attendance_days

    # @return [Array<TeacherSummary>] teacher summaries for this workshop.
    attr_accessor :teacher_summaries

    # @return [WorkshopPayment] payment information for this workshop.
    attr_accessor :payment

    def qualified?
      !payment.nil?
    end

    def section_url
      CDO.code_org_url("/teacher-dashboard#/sections/#{workshop.section.id}", 'http:')
    end

    def workshop_url
      CDO.studio_url("pd/workshop_dashboard/workshops/#{workshop.id}", 'http:')
    end

    def num_teachers
      teacher_summaries.count
    end

    def num_qualified_teachers
      teacher_summaries.count(&:qualified?)
    end

    def plp
      workshop.professional_learning_partner
    end

    def attendance_count_per_session
      session_attendance_summaries.map(&:teacher_ids).map(&:count)
    end
  end
end
