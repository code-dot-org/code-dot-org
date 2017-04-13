require 'test_helper'

module Pd::Payment2
  class PaymentCalculatorTest < ActiveSupport::TestCase
    setup_all do
      @regional_partner = create :regional_partner

      @csf_workshop = create :pd_ended_workshop, course: Pd::Workshop::COURSE_CSF, num_enrollments: 20
      @csp_workshop = create :pd_ended_workshop, course: Pd::Workshop::COURSE_CSP, num_enrollments: 20

    end

    test 'Raise error if workshop is not ended' do

    end

    test 'Calculate CSF Workshop payment' do

    end

    test 'Calculate CSF Workshop with insufficient attendees' do

    end

    test 'Calculate CSF Workshop with insufficient teachers who did puzzles' do

    end

    test 'Calculate CSP Workshop' do

    end

    test 'Calculate CSP Workshop with insufficient attendees' do

    end

    test 'Calculate CSP Workshop with more than the maximum number of attendees' do

    end

    test 'Raises error if there is no payment term' do

    end

    test 'Calculate CSP Workshop Payment with fixed payment amount' do

    end
  end
end