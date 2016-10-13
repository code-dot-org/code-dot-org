module Pd::Payment
  class TeacherSummary
    attr_accessor :teacher, :enrollment, :school_district, :school #, :days, :hours

    attr_accessor :raw_days, :raw_hours

    attr_accessor :days, :hours

    attr_accessor :workshop_summary

    # @return [TeacherPayment] payment information for this teacher in this workshop
    attr_accessor :payment

    def qualified?
      !payment.nil?
    end
  end
end
