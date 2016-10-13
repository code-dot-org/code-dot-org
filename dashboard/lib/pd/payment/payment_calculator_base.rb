module Pd::Payment
  SessionAttendanceSummary = Struct.new :hours, :teacher_ids
  TeacherAttendanceTotal = Struct.new :days, :hours do
    def add_session(hours)
      self.days += 1
      self.hours += hours
    end
  end

  # Base class for Pd::Workshop payment calculator. It calculates workshop duration, attendance numbers,
  # other general fields relevant to payment, and populates a #WorkshopPayment and one #TeacherPayment per teacher.
  # The class is a singleton, and should be used via #.instance.calculate(workshop)
  # Derived classes can override to provide custom logic.
  class PaymentCalculatorBase
    include Singleton

    DATE_FORMAT = '%m/%d/%Y'

    # Calculates payment information for a workshop and its teachers.
    # @param workshop [Pd::Workshop]
    # @return [WorkshopSummary] Calculated workshop summary with embedded payment information.
    def calculate(workshop)
      raise 'Workshop required.' unless workshop
      raise 'Workshop must be ended.' unless workshop.ended_at

      WorkshopSummary.new.tap do |workshop_summary|
        workshop_summary.workshop = workshop
        workshop_summary.calculator_class = self.class
        workshop_summary.pay_period = get_pay_period workshop

        workshop_summary.num_days = workshop.effective_num_days
        workshop_summary.num_hours = workshop.effective_num_hours
        workshop_summary.min_attendance_days = workshop.min_attendance_days

        workshop_summary.session_attendance_summaries = get_session_attendance_summaries workshop
        raw_teacher_attendance = calculate_raw_teacher_attendance workshop_summary.session_attendance_summaries

        workshop_summary.teacher_summaries = construct_teacher_summaries workshop_summary, raw_teacher_attendance
        workshop_summary.total_teacher_attendance_days = workshop_summary.teacher_summaries.select(&:qualified?).map(&:days).reduce(0, :+)
        workshop_summary.payment = construct_workshop_payment workshop_summary
      end
    end

    # Determines pay period from a workshop
    # @param workshop [Pd::Workshop]
    # @return [String] pay period
    def get_pay_period(workshop)
      date = workshop.ended_at

      if date.day <= 15
        d_start = Date.new(date.year, date.month, 1)
        d_end = Date.new(date.year, date.month, 15)
      else
        d_start = Date.new(date.year, date.month, 16)
        d_end = Date.new(date.year, date.month, -1)
      end

      "#{d_start.strftime(DATE_FORMAT)} - #{d_end.strftime(DATE_FORMAT)}"
    end

    protected

    # Determines the payment type.
    # Override in derived classes. Default is either "PLP Urban" or "PLP Non-urban"
    # for workshops organized by a PLP, otherwise nil.
    # @param workshop [Pd::Workshop]
    # @return [String] payment type
    def get_payment_type(workshop)
      plp = workshop.professional_learning_partner
      return nil unless plp
      plp.urban? ? 'PLP Urban' : 'PLP Non-urban'
    end

    # Is the workshop qualified for payment?
    # Override in derived classes to apply workshop qualification rules.
    # Default is qualified when at least one teacher attended.
    # @param total_teacher_attendance_days [Integer] total number of teacher days attended.
    # @return [Boolean] whether or not the workshop is qualified for payment.
    def qualified?(total_teacher_attendance_days)
      total_teacher_attendance_days > 0
    end

    # Override in derived classes to apply teacher qualification rules.
    # Return true/false for a given teacher, whether the teacher is qualified.
    # @param teacher [User]
    # @return [Boolean] whether or not the teacher is qualified for payment.
    def teacher_qualified?(teacher)
      true
    end

    # Calculates payment amounts. Override in derived classes.
    # @param summary [WorkshopSummary] calculated workshop details that go into payment amount calculation.
    # @return [Hash{String => Numeric}] Map of payment parts (e.g. :food) to their dollar amounts.
    def calculate_payment_amounts(summary)
      {}
    end

    # Gets session attendance summaries for a workshop.
    # @param workshop [Pd::Workshop]
    # @return [Array<SessionAttendanceSummary>] summary of attendance for each session.
    def get_session_attendance_summaries(workshop)
      workshop.sessions.map do |session|
        teacher_ids = Pd::Attendance.where(pd_session_id: session.id).pluck(:teacher_id)
        SessionAttendanceSummary.new session.hours, teacher_ids
      end
    end

    private

    # Calculates raw attendance totals per teacher based on a supplied set of session attendance summaries.
    # @param session_attendance_summaries [Array<SessionAttendanceSummary>]
    #   Summary of teacher attendance for each session
    # @return [Hash{Integer => TeacherAttendanceTotal}]
    #   Map of teacher id to raw attendance totals for that teacher.
    def calculate_raw_teacher_attendance(session_attendance_summaries)
      {}.tap do |raw_attendance_per_teacher|
        session_attendance_summaries.each do |session_attendance_summary|
          hours = session_attendance_summary.hours
          session_attendance_summary.teacher_ids.each do |teacher_id|
            if raw_attendance_per_teacher[teacher_id]
              raw_attendance_per_teacher[teacher_id].add_session hours
            else
              raw_attendance_per_teacher[teacher_id] = TeacherAttendanceTotal.new 1, hours
            end
          end
        end
      end
    end

    # Constructs workshop payment from a workshop summary
    # @param workshop_summary [WorkshopSummary]
    # @return [WorkshopPayment]
    def construct_workshop_payment(workshop_summary)
      return unless qualified? workshop_summary.total_teacher_attendance_days

      WorkshopPayment.new.tap do |workshop_payment|
        workshop_payment.summary = workshop_summary
        workshop_payment.type = get_payment_type workshop_summary.workshop
        workshop_payment.amounts = calculate_payment_amounts workshop_summary
        workshop_payment.total = workshop_payment.amounts.values.reduce(0, :+)
      end
    end

    # Constructs teacher summaries (including payment) for each teacher in the workshop.
    # @param workshop_summary [WorkshopSummary]
    # @param raw_teacher_attendance [Hash{Integer => TeacherAttendanceTotal}]
    #   Map of teacher id to raw attendance totals for that teacher.
    # @return [Array<TeacherSummary>]
    def construct_teacher_summaries(workshop_summary, raw_teacher_attendance)
      enrollments_by_teacher_id = {}
      enrolled_teachers_by_id = {}
      workshop_summary.workshop.enrollments.each do |enrollment|
        teacher = enrollment.resolve_user
        if teacher
          enrollments_by_teacher_id[teacher.id] = enrollment
          enrolled_teachers_by_id[teacher.id] = teacher
        end
      end

      # Generate a teacher summary for all teachers in raw attendance.
      raw_teacher_attendance.keys.map do |teacher_id|
        enrollment = enrollments_by_teacher_id[teacher_id]
        teacher = enrolled_teachers_by_id[teacher_id] || User.find(teacher_id)

        TeacherSummary.new.tap do |teacher_summary|
          raw_attendance = raw_teacher_attendance[teacher_id]

          teacher_summary.workshop_summary = workshop_summary
          teacher_summary.enrollment = enrollment
          teacher_summary.teacher = teacher
          teacher_summary.raw_days = raw_attendance.days
          teacher_summary.raw_hours = raw_attendance.hours

          adjust_teacher_attendance teacher_summary, workshop_summary.min_attendance_days,
            workshop_summary.num_days, workshop_summary.num_hours

          if enrollment
            teacher_summary.school = teacher_summary.enrollment.school
            teacher_summary.school_district = teacher_summary.enrollment.school_info.try(&:school_district)
          end

          if teacher_summary.days > 0 && teacher_qualified?(teacher)
            teacher_summary.payment = construct_teacher_payment(teacher_summary)
          end
        end
      end
    end

    # Calculates adjusted teacher attendance, after applying min / max attendance and qualification rules.
    # Applies the adjusted attendance directly to the supplied #TeacherSummary
    # @param teacher_summary [TeacherSummary]
    # @param min_attendance_days [Integer] minimum days raw attendance to count at all.
    # @param num_days [Integer] max number of days.
    # @param num_hours [Integer] max number of hours.
    def adjust_teacher_attendance(teacher_summary, min_attendance_days, num_days, num_hours)
      if teacher_summary.raw_days < min_attendance_days
        teacher_summary.days = teacher_summary.hours = 0
      else
        teacher_summary.days = [teacher_summary.raw_days, num_days].min
        teacher_summary.hours = [teacher_summary.raw_hours, num_hours].min
      end
      nil
    end

    # Constructs a teacher payment from a teacher summary.
    # @param teacher_summary [TeacherSummary]
    # @return [TeacherPayment]
    def construct_teacher_payment(teacher_summary)
      TeacherPayment.new.tap do |teacher_payment|
        teacher_payment.summary = teacher_summary

        if teacher_summary.school_district
          teacher_payment.district_payment_term = Pd::DistrictPaymentTerm.find_by(
            course: teacher_summary.workshop_summary.workshop.course,
            school_district_id: teacher_summary.school_district.id
          )

          teacher_payment.amount = calculate_teacher_payment_amount teacher_payment.district_payment_term,
            teacher_summary.hours, teacher_summary.days
        end
      end
    end

    # Calculates the amount for a teacher payment.
    # @param district_payment_term [DistrictPaymentTerm]
    # @param hours [Integer] attendance hours
    # @param days [Integer] attendance days
    # @return [Float] payment amount
    def calculate_teacher_payment_amount(district_payment_term, hours, days)
      return 0 unless district_payment_term
      rate = district_payment_term.rate

      case district_payment_term.rate_type
        when Pd::DistrictPaymentTerm::RATE_HOURLY
          return hours * rate
        when Pd::DistrictPaymentTerm::RATE_DAILY
          return days * rate
        else
          raise "Unexpected district payment term rate type #{district_payment_term.rate_type} for id #{district_payment_term.id}"
      end
    end
  end
end
