module Pd::Payment
  SessionAttendanceSummary = Struct.new :hours, :enrollment_ids
  TeacherAttendanceTotal = Struct.new :days, :hours do
    def add_session(hours)
      self.days += 1
      self.hours += hours
    end
  end

  # Base class for Pd::Workshop payment calculator. It calculates workshop duration, attendance numbers,
  # other general fields relevant to payment, and populates a #WorkshopSummary.
  # The class is a singleton, and should be used via #.instance.calculate(workshop)
  # Derived classes can override to provide custom logic.
  class PaymentCalculatorBase
    include Singleton

    DATE_FORMAT = '%m/%d/%Y'.freeze

    # Calculates payment information for a workshop and its teachers.
    # @param workshop [Pd::Workshop]
    # @return [WorkshopSummary] Calculated workshop summary with embedded payment information.
    def calculate(workshop)
      raise 'Workshop required.' unless workshop
      raise 'Workshop must be ended.' unless workshop.ended_at

      workshop.resolve_enrolled_users
      session_attendance_summaries = get_session_attendance_summaries workshop
      raw_teacher_attendance = calculate_raw_teacher_attendance session_attendance_summaries

      WorkshopSummary.new(
        workshop: workshop,
        pay_period: get_pay_period(workshop),
        num_days: workshop.effective_num_days,
        num_hours: workshop.effective_num_hours,
        min_attendance_days: workshop.min_attendance_days,
        calculator_class: self.class,
        attendance_count_per_session: session_attendance_summaries.map(&:enrollment_ids).map(&:count)
      ).tap do |workshop_summary|
        workshop_summary.teacher_summaries = construct_teacher_summaries workshop_summary, raw_teacher_attendance
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
    # for workshops organized by a Regional Partner, otherwise nil.
    # @param workshop [Pd::Workshop]
    # @return [String] payment type
    def get_payment_type(workshop)
      partner = workshop.regional_partner
      return nil unless partner
      partner.urban? ? 'PLP Urban' : 'PLP Non-urban'
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
    # Return true/false for a given enrollment, based on whether the enrolled teacher is qualified.
    # @param enrollment [Pd::Enrollment]
    # @return [Boolean] whether or not the enrolled teacher is qualified for payment.
    def teacher_qualified?(enrollment)
      true
    end

    # Calculates payment amounts. Override in derived classes.
    # @param workshop_summary [WorkshopSummary] calculated workshop details that go into payment amount calculation.
    # @return [Hash{String => Numeric}] Map of payment parts (e.g. :food) to their dollar amounts.
    def calculate_payment_amounts(workshop_summary)
      {}
    end

    # Gets session attendance summaries for a workshop.
    # @param workshop [Pd::Workshop]
    # @return [Array<SessionAttendanceSummary>] summary of attendance for each session.
    def get_session_attendance_summaries(workshop)
      workshop.sessions.map do |session|
        session_attendances = Pd::Attendance.where(pd_session_id: session.id.to_s)
        enrollment_ids = session_attendances.all.map(&:resolve_enrollment).compact.map(&:id).uniq
        SessionAttendanceSummary.new session.hours, enrollment_ids
      end
    end

    private

    # Calculates raw attendance totals per teacher based on a supplied set of session attendance summaries.
    # @param session_attendance_summaries [Array<SessionAttendanceSummary>]
    #   Summary of teacher attendance for each session
    # @return [Hash{Integer => TeacherAttendanceTotal}]
    #   Map of enrollment id to raw attendance totals for that enrollment.
    def calculate_raw_teacher_attendance(session_attendance_summaries)
      {}.tap do |raw_attendance_per_teacher|
        session_attendance_summaries.each do |session_attendance_summary|
          hours = session_attendance_summary.hours
          session_attendance_summary.enrollment_ids.each do |enrollment_id|
            if raw_attendance_per_teacher[enrollment_id]
              raw_attendance_per_teacher[enrollment_id].add_session hours
            else
              raw_attendance_per_teacher[enrollment_id] = TeacherAttendanceTotal.new 1, hours
            end
          end
        end
      end
    end

    # Constructs workshop payment from a workshop summary
    # @param workshop_summary [WorkshopSummary]
    # @return [WorkshopPayment, nil] Payment details, or nil if the workshop is not qualified for payment.
    def construct_workshop_payment(workshop_summary)
      return nil unless qualified?(workshop_summary.total_teacher_attendance_days)

      WorkshopPayment.new(
        summary: workshop_summary,
        type: get_payment_type(workshop_summary.workshop),
        amounts: calculate_payment_amounts(workshop_summary)
      )
    end

    # Constructs teacher summaries (including payment) for each teacher in the workshop.
    # @param workshop_summary [WorkshopSummary]
    # @param raw_teacher_attendance [Hash{Integer => TeacherAttendanceTotal}]
    #   Map of enrollment id to raw attendance totals for that teacher.
    # @return [Array<TeacherSummary>] summary for each teacher.
    def construct_teacher_summaries(workshop_summary, raw_teacher_attendance)
      enrollments_by_id = workshop_summary.workshop.enrollments.with_deleted.map {|e| [e.id, e]}.to_h

      # Generate a teacher summary for all teachers in raw attendance.
      raw_teacher_attendance.map do |enrollment_id, raw_attendance|
        enrollment = enrollments_by_id[enrollment_id]
        raise "Unable to find enrollment #{enrollment_id}" unless enrollment
        teacher = enrollment.user_id ? User.with_deleted.find(enrollment.user_id) : nil

        days, hours = calculate_adjusted_teacher_attendance raw_attendance, workshop_summary.min_attendance_days,
          workshop_summary.num_days, workshop_summary.num_hours

        TeacherSummary.new(
          workshop_summary: workshop_summary,
          teacher: teacher,
          enrollment: enrollment,
          raw_days: raw_attendance.days,
          raw_hours: raw_attendance.hours,
          days: days,
          hours: hours,
        ).tap do |teacher_summary|
          if teacher_summary.days > 0 && teacher_qualified?(enrollment)
            teacher_summary.payment = construct_teacher_payment(teacher_summary)
          end
        end
      end
    end

    # Calculates adjusted teacher attendance, after applying min / max attendance and qualification rules.
    # @param raw_attendance [TeacherAttendanceTotal] raw attendance for the teacher
    # @param min_attendance_days [Integer] minimum days raw attendance to count at all.
    # @param num_days [Integer] max number of days.
    # @param num_hours [Integer] max number of hours.
    # @return [Array<Integer, Integer>] - adjusted days and hours
    def calculate_adjusted_teacher_attendance(raw_attendance, min_attendance_days, num_days, num_hours)
      days = hours = 0
      if raw_attendance.days >= min_attendance_days
        days = [raw_attendance.days, num_days].min
        hours = [raw_attendance.hours, num_hours].min
      end
      [days, hours]
    end

    # Constructs a teacher payment from a teacher summary.
    # @param teacher_summary [TeacherSummary]
    # @return [TeacherPayment]
    def construct_teacher_payment(teacher_summary)
      district_payment_term = nil
      if teacher_summary.school_district
        district_payment_term = Pd::DistrictPaymentTerm.find_by(
          course: teacher_summary.workshop_summary.workshop.course,
          school_district_id: teacher_summary.school_district.id
        )
      end

      amount = calculate_teacher_payment_amount district_payment_term,
        teacher_summary.hours, teacher_summary.days

      TeacherPayment.new(
        summary: teacher_summary,
        amount: amount,
        district_payment_term: district_payment_term
      )
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
