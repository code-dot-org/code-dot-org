module Pd::Payment
  module PaymentFactory
    def self.get_payment(workshop)
      raise 'Workshop required.' unless workshop && workshop.is_a?(Pd::Workshop)
      get_calculator_class(workshop).try{|payment| payment.instance.calculate(workshop)}
    end

    def self.get_calculator_class(workshop)
      if workshop.workshop_type == Pd::Workshop::TYPE_DISTRICT
        return PaymentCalculatorDistrict if [
          Pd::Workshop::COURSE_CS_IN_A,
          Pd::Workshop::COURSE_CS_IN_S
        ].include? workshop.course
      else # Public / Private
        return PaymentCalculatorCSF if workshop.course == Pd::Workshop::COURSE_CSF

        return PaymentCalculatorStandard if [
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
