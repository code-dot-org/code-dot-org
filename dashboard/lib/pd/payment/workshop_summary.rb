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

    def generate_organizer_report_line_item(with_payment = false)
      line_item = {
        organizer_name: workshop.organizer.name,
        organizer_id: workshop.organizer.id,
        organizer_email: workshop.organizer.email,
        workshop_dates: workshop.sessions.map(&:formatted_date).join(' '),
        workshop_type: workshop.workshop_type,
        section_url: section_url,
        facilitators: workshop.facilitators.map(&:name).join(', '),
        num_facilitators: workshop.facilitators.count,
        workshop_id: workshop.id,
        workshop_name: workshop.friendly_name,
        course: workshop.course,
        subject: workshop.subject,
        num_registered: workshop.enrollments.count,
        num_qualified_teachers: num_qualified_teachers,
        days: num_days,
      }

      # Facilitator names and emails, 1-6
      (1..6).each do |n|
        line_item["facilitator_name_#{n}".to_sym] = workshop.facilitators[n - 1].try(&:name)
        line_item["facilitator_email_#{n}".to_sym] = workshop.facilitators[n - 1].try(&:email)
      end

      # Attendance days 1-5
      session_attendance_counts = attendance_count_per_session
      (1..5).each do |n|
        line_item["attendance_day_#{n}".to_sym] = session_attendance_counts[n - 1]
      end

      if with_payment
        line_item.merge!({
          pay_period: pay_period,
          payment_type: payment.try(&:type),
          qualified: qualified?,
          teacher_attendance_days: total_teacher_attendance_days,
          food_payment: payment.try{|p| p.amounts[:food]},
          facilitator_payment: payment.try{|p| p.amounts[:facilitator]},
          staffer_payment: payment.try{|p| p.amounts[:staffer]},
          venue_payment: payment.try{|p| p.amounts[:venue]},
          payment_total: payment.try(&:total)
        })
      end

      line_item
    end
  end
end
