require 'test_helper'
require 'cdo/activity_constants'

module Pd::Payment
  class PaymentCalculatorDistrictTest < ActiveSupport::TestCase
    setup do
      @workshop = create :pd_ended_workshop,
        workshop_type: Pd::Workshop::TYPE_DISTRICT,
        course: Pd::Workshop::COURSE_CS_IN_A,
        subject: Pd::Workshop::SUBJECT_CS_IN_A_PHASE_2,
        num_sessions: 3

      # 2 facilitators
      2.times do
        @workshop.facilitators << create(:facilitator)
      end

      # One unqualified teacher, below min attendance
      create :pd_workshop_participant, workshop: @workshop,
        enrolled: true, in_section: true, attended: [@workshop.sessions.first]

      # 10 qualified teachers: 1 at partial (2 days) attendance, and 9 more at full (3 days) attendance
      # 10 is the max # to still count as a small venue.
      create :pd_workshop_participant, workshop: @workshop,
        enrolled: true, in_section: true, attended: @workshop.sessions.first(2)

      9.times do
        create :pd_workshop_participant, workshop: @workshop,
          enrolled: true, in_section: true, attended: @workshop.sessions
      end
    end

    test 'payment' do
      payment = PaymentCalculatorDistrict.instance.calculate @workshop

      assert payment.qualified
      assert_equal 11, payment.num_teachers
      assert_equal 10, payment.num_qualified_teachers
      assert_equal 29, payment.total_teacher_attendance_days

      expected_payment_amounts = {
        food: 1160,
        facilitator: 3000
      }
      assert_equal expected_payment_amounts, payment.payment_amounts
      assert_equal 4160, payment.payment_total
    end
  end
end
