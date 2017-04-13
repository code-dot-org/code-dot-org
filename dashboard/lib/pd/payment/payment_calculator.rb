module Pd::Payment
  class PaymentCalculator
    include Singleton
    MINIMUM_PUZZLES_FOR_CSF_QUALIFICATION = 10
    MINIMUM_QUALIFIED_TEACHERS_FOR_CSF = 10
    PAYMENT_PER_TEACHER_CSF = 50

    # Under these payment terms we can have a *much* simpler workshop payment calculator
    def calculate(workshop)
      raise "Workshop #{workshop.id} is not ended - cannot pay" if
          workshop.state != Pd::Workshop::STATE_ENDED

      if workshop.course == Pd::Workshop::COURSE_CSF
        calculate_csf_payment(workshop)
      else
        calculate_non_csf_payment(workshop)
      end
    end

    private

    def calculate_csf_payment(workshop)
      return 0 if workshop.workshop_type == Pd::Workshop::TYPE_DISTRICT

      attending_teachers = workshop.sessions.flat_map(&:attendances).flat_map(&:teacher).uniq

      qualified_teacher_count = 0

      # We can probably improve the performance here by doing a group by
      if attending_teachers.size >= 10
        attending_teachers.each do |teacher|
          qualified_teacher_count += 1 if UserLevel.where(user: teacher).passing.count >= MINIMUM_PUZZLES_FOR_CSF_QUALIFICATION
        end
      end

      if qualified_teacher_count >= MINIMUM_QUALIFIED_TEACHERS_FOR_CSF
        qualified_teacher_count * PAYMENT_PER_TEACHER_CSF
      else
        0
      end
    end

    def calculate_non_csf_payment(workshop)
    end
  end
end
