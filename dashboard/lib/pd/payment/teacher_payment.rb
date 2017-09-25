module Pd::Payment
  class TeacherPayment
    def initialize(
      summary:,
      district_payment_term: nil,
      amount:
    )
      @summary = summary
      @district_payment_term = district_payment_term
      @amount = amount
    end

    attr_reader :summary

    # @return [DistrictPaymentTerm] payment details, if any, for this teacher's district
    attr_reader :district_payment_term

    # @return [Numeric] total payment amount
    attr_reader :amount

    def type
      district_payment_term.try(&:rate_type)
    end

    def rate
      district_payment_term.try(&:rate)
    end
  end
end
