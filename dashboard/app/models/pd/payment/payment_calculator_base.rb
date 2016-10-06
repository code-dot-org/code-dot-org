module Pd::Payment
  SessionAttendanceSummary = Struct.new :hours, :teacher_ids
  TeacherAttendanceTotal = Struct.new :days, :hours do
    def add_session(hours)
      self.days += 1
      self.hours += hours
    end
  end

  # Base class for Pd::Workshop payment calculator. It calculates workshop duration, attendance numbers,
  # other general fields relevant to payment, and populates a #WorkshopPayment
  # The class is a singleton, and should be used via #.instance.calculate(workshop)
  # Derived classes can override to provide custom logic.
  class PaymentCalculatorBase
    include Singleton

    DATE_FORMAT = '%m/%d/%Y'

    # Calculates a WorkshopPayment from a workshop
    # @param workshop [Pd::Workshop]
    # @return [WorkshopPayment] the calculated payment.
    def calculate(workshop)
      raise 'Workshop required.' unless workshop
      raise 'Workshop must be ended.' unless workshop.ended_at

      WorkshopPayment.new.tap do |payment|
        payment.workshop = workshop
        payment.calculator_class = self.class
        payment.pay_period = get_pay_period workshop

        payment.num_days = workshop.effective_num_days
        payment.num_hours = workshop.effective_num_hours
        payment.min_attendance_days = workshop.min_attendance_days

        payment.session_attendance_summaries = get_session_attendance_summaries workshop
        payment.raw_teacher_attendance = calculate_raw_teacher_attendance payment.session_attendance_summaries
        payment.adjusted_teacher_attendance = adjust_teacher_attendance(
          payment.raw_teacher_attendance,
          payment.min_attendance_days,
          payment.num_days,
          payment.num_hours
        )

        payment.total_teacher_attendance_days = payment.adjusted_teacher_attendance.values.map(&:days).reduce(0, :+)

        payment.qualified = qualified? payment.total_teacher_attendance_days
        payment.payment_type = get_payment_type workshop
        payment.payment_amounts = calculate_payment_amounts payment
        payment.payment_total = payment.payment_amounts.values.reduce(0, :+)
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
    # Return true/false for a given teacher_id, whether the teacher is qualified.
    # @param teacher_id [Integer]
    # @return [Boolean] whether or not the teacher is qualified for payment.
    def teacher_qualified?(teacher_id)
      true
    end

    # Calculates payment amounts. Override in derived classes.
    # @param payment [Payment] calculated workshop details that go into payment amount calculation.
    # @return [Hash{String => Numeric}] Map of payment parts (e.g. :food) to their dollar amounts.
    def calculate_payment_amounts(payment)
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
    #
    # @param session_attendance_summaries [Array<SessionAttendanceSummary>]
    # summary of teacher attendance for each session
    #
    # @return [Hash{Integer => TeacherAttendanceTotal}] map of teacher id to raw attendance totals for that teacher.
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

    # Calculates adjusted teacher attendance, after applying min / max attendance and qualification rules
    # Filters out unqualified teachers, and those with 0 attendance.
    # Note - calls #teacher_qualified? for each teacher id
    #
    # @param raw_teacher_attendance [Hash{Integer => TeacherAttendanceTotal}]
    #   map of teacher id to raw attendance total for that teacher.
    # @param min_attendance_days [Integer] minimum days a teacher must be in attendance to count.
    # @param num_days [Integer] max number of days that will count for this workshop
    # @param num_hours [Integer] max number of hours that will count for this workshop
    #
    # @return [Hash{Integer => TeacherAttendanceTotal}] map of teacher id to adjusted attendance totals for that teacher.
    def adjust_teacher_attendance(raw_teacher_attendance, min_attendance_days, num_days, num_hours)
      {}.tap do |adjusted_attendance_per_teacher|
        # Filter out unqualified teachers.
        qualified_teacher_attendance = raw_teacher_attendance.select{|teacher_id| teacher_qualified?(teacher_id)}

        # Require min attendance, and apply caps (via @num_days & @num_hours).
        qualified_teacher_attendance.each do |teacher_id, teacher_attendance|
          adjusted_days = teacher_attendance.days < min_attendance_days ? 0 : [teacher_attendance.days, num_days].min
          next unless adjusted_days > 0

          adjusted_hours = [teacher_attendance.hours, num_hours].min
          adjusted_attendance_per_teacher[teacher_id] = TeacherAttendanceTotal.new adjusted_days, adjusted_hours
        end
      end
    end
  end
end
