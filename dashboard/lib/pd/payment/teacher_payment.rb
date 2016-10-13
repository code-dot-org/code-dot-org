module Pd::Payment
  class TeacherPayment
    attr_accessor :summary

    # @return [DistrictPaymentTerm] payment details, if any, for this teacher's district
    attr_accessor :district_payment_term

    #@return [Numeric] total payment amount
    attr_accessor :amount
  end
end
