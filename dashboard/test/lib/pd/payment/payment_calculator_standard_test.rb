require 'test_helper'

module Pd::Payment
  class PaymentCalculatorStandardTest < ActiveSupport::TestCase
    self.use_transactional_test_case = true

    setup do
      # TIME_CONSTRAINTS: COURSE_ECS => {SUBJECT_ECS_PHASE_4 => {min_days: 2, max_days: 3, max_hours: 18}}
      @workshop = create :workshop, :ended,
        on_map: true, funded: true,
        course: Pd::Workshop::COURSE_ECS,
        subject: Pd::Workshop::SUBJECT_ECS_PHASE_4,
        num_sessions: 3,
        num_facilitators: 2

      # One unqualified teacher, below min attendance
      create :pd_workshop_participant, workshop: @workshop,
        enrolled: true, attended: [@workshop.sessions.first]

      # 10 qualified teachers: 1 at partial (2 days) attendance, and 9 more at full (3 days) attendance
      # 10 is the max # to still count as a small venue.
      create :pd_workshop_participant, workshop: @workshop,
        enrolled: true, attended: @workshop.sessions.first(2)

      9.times do
        create :pd_workshop_participant, workshop: @workshop,
          enrolled: true, attended: @workshop.sessions
      end
    end

    test 'small venue non-regional-partner' do
      workshop_summary = PaymentCalculatorStandard.instance.calculate(@workshop)

      assert_nil workshop_summary.workshop.regional_partner
      assert_equal 11, workshop_summary.num_teachers
      assert_equal 10, workshop_summary.num_qualified_teachers
      assert_equal 29, workshop_summary.total_teacher_attendance_days

      assert workshop_summary.qualified?
      payment = workshop_summary.payment
      assert payment
      expected_payment_amounts = {
        food: 1160,
        facilitator: 3000,
        staffer: 750,
        venue: 1200
      }
      assert_equal expected_payment_amounts, payment.amounts
      assert_equal 6110, payment.total
    end

    test 'large venue regional partner non-urban' do
      rp = create :regional_partner, urban: false

      # Add an extra qualified teacher to go over the large venue threshold.
      create :pd_workshop_participant, workshop: @workshop,
        enrolled: true, attended: @workshop.sessions

      @workshop.regional_partner = rp

      workshop_summary = PaymentCalculatorStandard.instance.calculate(@workshop)

      assert_equal rp, workshop_summary.workshop.regional_partner
      assert_equal 12, workshop_summary.num_teachers
      assert_equal 11, workshop_summary.num_qualified_teachers
      assert_equal 32, workshop_summary.total_teacher_attendance_days

      assert workshop_summary.qualified?
      payment = workshop_summary.payment
      assert payment
      expected_payment_amounts = {
        food: 1280,
        facilitator: 3000,
        staffer: 750,
        venue: 1350
      }
      assert_equal expected_payment_amounts, payment.amounts
      assert_equal 6380, payment.total
    end

    test 'small venue regional partner urban' do
      rp = create :regional_partner, urban: true

      @workshop.regional_partner = rp

      workshop_summary = PaymentCalculatorStandard.instance.calculate(@workshop)

      assert_equal rp, workshop_summary.workshop.regional_partner
      assert_equal 11, workshop_summary.num_teachers
      assert_equal 10, workshop_summary.num_qualified_teachers
      assert_equal 29, workshop_summary.total_teacher_attendance_days

      assert workshop_summary.qualified?
      payment = workshop_summary.payment
      assert payment
      expected_payment_amounts = {
        food: 1450,
        facilitator: 3000,
        staffer: 937.5,
        venue: 1500
      }
      assert_equal expected_payment_amounts, payment.amounts
      assert_equal 6887.5, payment.total
    end
  end
end
