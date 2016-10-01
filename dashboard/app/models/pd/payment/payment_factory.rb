module Pd::Payment
  module PaymentFactory
    def self.get_payment(workshop)
      raise 'Workshop required.' unless workshop && workshop.is_a?(Pd::Workshop)
      get_payment_type(workshop).try{|p| p.new(workshop)}
    end

    def self.get_payment_type(workshop)
      if workshop.workshop_type == Pd::Workshop::TYPE_DISTRICT
        return DistrictPay if [
          Pd::Workshop::COURSE_CS_IN_A,
          Pd::Workshop::COURSE_CS_IN_S
        ].include? workshop.course
      else # Public / Private
        return CSFPay if workshop.course == Pd::Workshop::COURSE_CSF

        return StandardPay if [
          Pd::Workshop::COURSE_ECS,
          Pd::Workshop::COURSE_CSP,
          Pd::Workshop::COURSE_CS_IN_A,
          Pd::Workshop::COURSE_CS_IN_S
        ].include?(workshop.course)
      end

      nil
    end
  end
end
