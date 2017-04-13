require 'test_helper'

module Pd::Payment
  class PaymentCalculatorTest < ActiveSupport::TestCase
    self.use_transactional_test_case = true

    setup_all do
      @regional_partner = create :regional_partner

      @csf_workshop = create(:pd_ended_workshop, course: Pd::Workshop::COURSE_CSF, enrolled_and_attending_users: 20)
      @csp_workshop = create(:pd_ended_workshop, course: Pd::Workshop::COURSE_CSP, subject: Pd::Workshop::SUBJECT_CSP_WORKSHOP_1, enrolled_and_attending_users: 20)

      @csf_workshop.enrollments.map(&:user).each do |user|
        PaymentCalculator::MINIMUM_PUZZLES_FOR_CSF_QUALIFICATION.times do
          create(:user_level, user: user, best_result: ActivityConstants::PASSING_VALUES.sample)
        end
      end
    end

    test 'Raise error if workshop is not ended' do
      workshop = create(:pd_workshop, course: Pd::Workshop::COURSE_CSF, enrolled_and_attending_users: 20)
      error = assert_raises(RuntimeError) do
        PaymentCalculator.instance.calculate(workshop)
      end

      assert_equal "Workshop #{workshop.id} is not ended - cannot pay", error.message
    end

    test 'Calculate CSF Workshop payment' do
      assert_equal 1000, PaymentCalculator.instance.calculate(@csf_workshop)
    end

    test 'Calculate CSF Workshop with insufficient attendees' do
      insufficient_workshop = create(:pd_ended_workshop, course: Pd::Workshop::COURSE_CSF, enrolled_and_attending_users: 5)

      assert_equal 0, PaymentCalculator.instance.calculate(insufficient_workshop)
    end

    test 'Calculate CSF Workshop with insufficient teachers who did puzzles' do
      insufficient_puzzles = create(:pd_ended_workshop, course: Pd::Workshop::COURSE_CSF, enrolled_and_attending_users: 20)
      assert_equal 0, PaymentCalculator.instance.calculate(insufficient_puzzles)
    end
  end
end
