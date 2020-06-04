require 'test_helper'

module Pd::Payment
  class PaymentCalculatorDistrictTest < ActiveSupport::TestCase
    setup do
      @workshop = create :workshop, :ended,
        on_map: false, funded: false,
        course: Pd::Workshop::COURSE_CS_IN_A,
        subject: Pd::Workshop::SUBJECT_CS_IN_A_PHASE_2,
        num_sessions: 3,
        num_facilitators: 2

      # One unqualified teacher, below min attendance
      create :pd_workshop_participant, workshop: @workshop,
        enrolled: true, attended: [@workshop.sessions.first]

      # 10 qualified teachers: 1 at partial (2 days) attendance, and 9 more at full (3 days) attendance
      create :pd_workshop_participant, workshop: @workshop,
        enrolled: true, attended: @workshop.sessions.first(2)

      9.times do
        create :pd_workshop_participant, workshop: @workshop,
          enrolled: true, attended: @workshop.sessions
      end
    end

    test 'payment' do
      workshop_summary = PaymentCalculatorDistrict.instance.calculate(@workshop)

      assert_equal 11, workshop_summary.num_teachers
      assert_equal 10, workshop_summary.num_qualified_teachers
      assert_equal 29, workshop_summary.total_teacher_attendance_days

      assert workshop_summary.qualified?
      payment = workshop_summary.payment
      assert payment
      expected_payment_amounts = {
        food: 1160,
        facilitator: 3000
      }
      assert_equal expected_payment_amounts, payment.amounts
      assert_equal 4160, payment.total
    end
  end
end
