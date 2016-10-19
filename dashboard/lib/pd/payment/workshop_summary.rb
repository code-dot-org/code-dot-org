module Pd::Payment
  class WorkshopSummary
    def initialize(
      workshop:,
      pay_period:,
      num_days:,
      num_hours:,
      min_attendance_days:,
      calculator_class:,
      attendance_count_per_session:
    )
      @workshop = workshop
      @pay_period = pay_period
      @num_days = num_days
      @num_hours = num_hours
      @min_attendance_days = min_attendance_days
      @calculator_class = calculator_class
      @attendance_count_per_session = attendance_count_per_session
      @teacher_summaries = []
    end

    attr_reader :workshop, :pay_period, :num_days, :num_hours, :min_attendance_days

    # @return [Class] calculator class that was used to calculate this payment.
    attr_reader :calculator_class

    # @return [Array<Integer>] Number of teachers marked attended for each session.
    # This does not take into account min attendance or max sessions.
    attr_reader :attendance_count_per_session

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

    # @return [Integer] Total adjusted days attended by all qualified teachers (one per teacher per day).
    def total_teacher_attendance_days
      teacher_summaries.select(&:qualified?).map(&:days).reduce(0, :+)
    end
  end
end
