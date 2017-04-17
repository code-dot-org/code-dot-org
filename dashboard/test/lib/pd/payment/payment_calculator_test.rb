require 'test_helper'

module Pd::Payment
  class PaymentCalculatorTest < ActiveSupport::TestCase
    self.use_transactional_test_case = true

    test 'Raise error if workshop is not ended' do
      workshop = create(:pd_workshop, course: Pd::Workshop::COURSE_CSF)
      error = assert_raises(RuntimeError) do
        PaymentCalculator.instance.calculate(workshop)
      end

      assert_equal "Workshop #{workshop.id} is not ended - cannot pay", error.message
    end

    test 'Calculate CSF Workshop payment' do
      workshop = create(:pd_ended_workshop, course: Pd::Workshop::COURSE_CSF, enrolled_and_attending_users: 20)

      create_passed_levels(workshop.enrollments[0..9])

      assert_equal 500, PaymentCalculator.instance.calculate(workshop)
    end

    test 'Calculate CSF Workshop with insufficient attendees' do
      insufficient_workshop = create(:pd_ended_workshop, course: Pd::Workshop::COURSE_CSF, enrolled_and_attending_users: 5)

      assert_equal 0, PaymentCalculator.instance.calculate(insufficient_workshop)
    end

    test 'Calculate CSF Workshop with insufficient teachers who did puzzles' do
      insufficient_puzzles = create(:pd_ended_workshop, course: Pd::Workshop::COURSE_CSF, enrolled_and_attending_users: 20)
      create_passed_levels(insufficient_puzzles.enrollments[0..5])
      assert_equal 0, PaymentCalculator.instance.calculate(insufficient_puzzles)
    end

    private

    def create_passed_levels(enrollments)
      enrollments.map(&:user).each do |user|
        PaymentCalculator::MINIMUM_PUZZLES_FOR_CSF_QUALIFICATION.times do
          create(:user_level, user: user, best_result: ActivityConstants::MINIMUM_PASS_RESULT)
        end
      end
    end
  end
end
