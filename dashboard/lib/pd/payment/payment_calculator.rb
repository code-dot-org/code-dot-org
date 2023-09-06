module Pd::Payment
  class PaymentCalculator
    include Singleton
    MINIMUM_PUZZLES_FOR_CSF_QUALIFICATION = 10
    PAYMENT_PER_TEACHER_CSF = 50

    def calculate(workshop)
      if workshop.state != Pd::Workshop::STATE_ENDED
        raise "Workshop #{workshop.id} is not ended - cannot pay"
      end

      if workshop.course == Pd::Workshop::COURSE_CSF
        calculate_csf_payment(workshop)
      else
        calculate_workshop_payment(workshop)
      end
    end

    private

    def calculate_csf_payment(workshop)
      return 0 unless workshop.funded

      attending_teachers = workshop.attending_teachers

      qualified_teacher_count = 0

      # We can probably improve the performance here by doing a group by
      attending_teachers.each do |teacher|
        qualified_teacher_count += 1 if UserLevel.where(user: teacher).passing.count >= MINIMUM_PUZZLES_FOR_CSF_QUALIFICATION
      end

      qualified_teacher_count * PAYMENT_PER_TEACHER_CSF
    end

    def calculate_workshop_payment(workshop)
      attending_teachers = workshop.attending_teachers
      payment_term = Pd::PaymentTerm.for_workshop(workshop)

      raise "No payment terms found for workshop #{workshop.id}" unless payment_term

      payment_sum = payment_term.fixed_payment || 0

      if payment_term.minimum_enrollees_for_payment? &&
         workshop.enrollments.size < payment_term.minimum_enrollees_for_payment
        return 0
      end

      if payment_term.per_attendee_payment?
        payment_sum +=
          if payment_term.maximum_attendees_for_payment?
            [attending_teachers.size, payment_term.maximum_attendees_for_payment].min * payment_term.per_attendee_payment
          else
            attending_teachers.size * payment_term.per_attendee_payment
          end
      end

      if payment_term.facilitator_payment?
        payment_sum += workshop.facilitators.size * payment_term.facilitator_payment
      end

      payment_sum
    end
  end
end
