module Pd::Payment
  module PaymentFactory
    def self.get_payment(workshop)
      raise 'Workshop required.' unless workshop && workshop.is_a?(Pd::Workshop)
      get_calculator_class(workshop).instance.calculate(workshop)
    end

    def self.get_calculator_class(workshop)
      if workshop.funded
        return PaymentCalculatorCSF if workshop.course == Pd::Workshop::COURSE_CSF

        return PaymentCalculatorStandard if [
          Pd::Workshop::COURSE_ECS,
          Pd::Workshop::COURSE_CSP,
          Pd::Workshop::COURSE_CS_IN_A,
          Pd::Workshop::COURSE_CS_IN_S
        ].include?(workshop.course)

        return PaymentCalculatorCounselorAdmin if [
          Pd::Workshop::COURSE_COUNSELOR,
          Pd::Workshop::COURSE_ADMIN
        ].include?(workshop.course)
      else
        # TODO: elijah remove this condition once we stop funded these legacy
        # programs
        return PaymentCalculatorDistrict if [
          Pd::Workshop::COURSE_CS_IN_A,
          Pd::Workshop::COURSE_CS_IN_S
        ].include? workshop.course
      end

      PaymentCalculatorUnpaid
    end
  end
end
