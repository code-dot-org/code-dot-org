require 'test_helper'

module Pd::Payment
  class PaymentCalculatorTest < ActiveSupport::TestCase
    self.use_transactional_test_case = true
    freeze_time

    setup_all do
      @program_manager = create :workshop_organizer
      @regional_partner = create :regional_partner, program_managers: [@program_manager]

      @csp_workshop = create :csp_academic_year_workshop,
        :ended,
        organizer: @program_manager,
        enrolled_and_attending_users: 20,
        num_sessions: 2
    end

    test 'Raise error if workshop is not ended' do
      workshop = create(:workshop, course: Pd::Workshop::COURSE_CSF)
      error = assert_raises(RuntimeError) do
        PaymentCalculator.instance.calculate(workshop)
      end

      assert_equal "Workshop #{workshop.id} is not ended - cannot pay", error.message
    end

    test 'Calculate CSF Workshop payment' do
      workshop = create(:workshop, :ended, :funded, course: Pd::Workshop::COURSE_CSF, enrolled_and_attending_users: 20)
      create_passed_levels(workshop.enrollments[0..9])

      assert_equal 500, PaymentCalculator.instance.calculate(workshop)
    end

    test 'Calculate CSF Workshop with only some teachers who did puzzles' do
      insufficient_puzzles = create(:workshop, :ended, :funded, course: Pd::Workshop::COURSE_CSF, enrolled_and_attending_users: 20)
      create_passed_levels(insufficient_puzzles.enrollments[0..5])
      assert_equal 300, PaymentCalculator.instance.calculate(insufficient_puzzles)
    end

    test 'Error raised if there is no payment term for workshop' do
      error = assert_raises(RuntimeError) do
        PaymentCalculator.instance.calculate(@csp_workshop)
      end

      assert error.message.include? "No payment terms were found for workshop #{@csp_workshop.inspect}"
    end

    test 'Error raised if workshop has no regional partner' do
      unpartnered_workshop = create :csp_academic_year_workshop, :ended, regional_partner: nil
      error = assert_raises(RuntimeError) do
        PaymentCalculator.instance.calculate(unpartnered_workshop)
      end

      assert_equal "Cannot calculate payment for workshop #{unpartnered_workshop.id} because there is no regional partner", error.message
    end

    test 'Calculate CSP Workshop with per attendee payment' do
      create(:pd_payment_term, regional_partner: @regional_partner, per_attendee_payment: 10, fixed_payment: nil)

      assert_equal 200, PaymentCalculator.instance.calculate(@csp_workshop)
    end

    test 'Calculate CSP Workshop with fixed payment' do
      create(:pd_payment_term, regional_partner: @regional_partner, fixed_payment: 42)

      assert_equal 42, PaymentCalculator.instance.calculate(@csp_workshop)
    end

    test 'Calculate CSP Workshop with per attendee payment and fixed payment' do
      create(:pd_payment_term, regional_partner: @regional_partner, fixed_payment: 42, per_attendee_payment: 10)

      assert_equal 242, PaymentCalculator.instance.calculate(@csp_workshop)
    end

    test 'Calculate CSP Workshop with excessive teachers' do
      create(:pd_payment_term, regional_partner: @regional_partner, per_attendee_payment: 10, maximum_attendees_for_payment: 19, fixed_payment: nil)

      assert_equal 190, PaymentCalculator.instance.calculate(@csp_workshop)
    end

    test 'Calculate CSP Workshop with insufficient teachers' do
      payment_term = create(:pd_payment_term, regional_partner: @regional_partner, per_attendee_payment: 10, minimum_enrollees_for_payment: 30, fixed_payment: nil)

      assert_equal 0, PaymentCalculator.instance.calculate(@csp_workshop)

      payment_term.update!(fixed_payment: 42)

      assert_equal 0, PaymentCalculator.instance.calculate(@csp_workshop)
    end

    test 'Calculate CSP Workshop with sufficient attendees and facilitator payment' do
      create(:pd_payment_term, regional_partner: @regional_partner, per_attendee_payment: 10, facilitator_payment: 50, fixed_payment: nil)

      assert_equal 300, PaymentCalculator.instance.calculate(@csp_workshop)
    end

    test 'Calculate CSP Workshop with insufficient attendees and facilitator payment' do
      create(:pd_payment_term, regional_partner: @regional_partner, fixed_payment: 42, minimum_enrollees_for_payment: 30, facilitator_payment: 50)

      assert_equal 0, PaymentCalculator.instance.calculate(@csp_workshop)
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
