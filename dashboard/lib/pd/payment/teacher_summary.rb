module Pd::Payment
  class TeacherSummary
    def initialize(
      workshop_summary:,
      teacher:,
      enrollment: nil,
      raw_days:,
      raw_hours:,
      days:,
      hours:
    )
      @workshop_summary = workshop_summary
      @teacher = teacher
      @enrollment = enrollment
      @raw_days = raw_days
      @raw_hours = raw_hours
      @days = days
      @hours = hours
    end

    attr_reader :workshop_summary

    attr_reader :teacher, :enrollment

    attr_reader :raw_days, :raw_hours

    attr_reader :days, :hours

    # @return [TeacherPayment] payment information for this teacher in this workshop
    attr_accessor :payment

    def qualified?
      !payment.nil?
    end

    def school_district
      enrollment.try(&:school_info).try(&:school_district)
    end

    def school
      enrollment.try(&:school)
    end
  end
end
