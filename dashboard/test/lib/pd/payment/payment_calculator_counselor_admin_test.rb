require 'test_helper'

module Pd::Payment
  class PaymentCalculatorCounselorAdminTest < ActiveSupport::TestCase
    setup do
      @workshop = create :counselor_workshop, :ended, :funded, num_sessions: 3

      # 10 qualified teachers: 1 at partial (2 days) attendance, and 9 more at full (3 days) attendance
      create :pd_workshop_participant, workshop: @workshop,
        enrolled: true, attended: @workshop.sessions.first(2)

      9.times do
        create :pd_workshop_participant, workshop: @workshop,
          enrolled: true, attended: @workshop.sessions
      end
    end

    test 'non-regional partner' do
      workshop_summary = PaymentCalculatorCounselorAdmin.instance.calculate(@workshop)

      assert_nil workshop_summary.workshop.regional_partner
      assert_equal 10, workshop_summary.num_teachers
      assert_equal 10, workshop_summary.num_qualified_teachers
      assert_equal 29, workshop_summary.total_teacher_attendance_days

      assert workshop_summary.qualified?
      payment = workshop_summary.payment
      assert payment
      expected_payment_amounts = {
        food: 580,
        staffer: 750,
        venue: 1200
      }
      assert_equal expected_payment_amounts, payment.amounts
      assert_equal 2530, payment.total
    end

    test 'regional partner non-urban' do
      rp = create :regional_partner, urban: false

      @workshop.regional_partner = rp

      workshop_summary = PaymentCalculatorCounselorAdmin.instance.calculate(@workshop)

      assert_equal rp, workshop_summary.workshop.regional_partner
      assert_equal 10, workshop_summary.num_teachers
      assert_equal 10, workshop_summary.num_qualified_teachers
      assert_equal 29, workshop_summary.total_teacher_attendance_days

      assert workshop_summary.qualified?
      payment = workshop_summary.payment
      assert payment
      expected_payment_amounts = {
        food: 580,
        staffer: 750,
        venue: 1200
      }
      assert_equal expected_payment_amounts, payment.amounts
      assert_equal 2530, payment.total
    end

    test 'regional partner urban' do
      rp = create :regional_partner, urban: true

      @workshop.regional_partner = rp

      workshop_summary = PaymentCalculatorCounselorAdmin.instance.calculate(@workshop)

      assert_equal rp, workshop_summary.workshop.regional_partner
      assert_equal 10, workshop_summary.num_teachers
      assert_equal 10, workshop_summary.num_qualified_teachers
      assert_equal 29, workshop_summary.total_teacher_attendance_days

      assert workshop_summary.qualified?
      payment = workshop_summary.payment
      assert payment
      expected_payment_amounts = {
        food: 725,
        staffer: 937.5,
        venue: 1500
      }
      assert_equal expected_payment_amounts, payment.amounts
      assert_equal 3162.5, payment.total
    end

    test 'no user account' do
      workshop = create :counselor_workshop, :ended, :funded

      5.times do
        enrollment = create :pd_enrollment, workshop: workshop
        create :pd_attendance, session: workshop.sessions.first, enrollment: enrollment
      end

      workshop_summary = PaymentCalculatorCounselorAdmin.instance.calculate(workshop)

      assert_equal 5, workshop_summary.num_teachers
      assert_equal 5, workshop_summary.num_qualified_teachers
      assert_equal 5, workshop_summary.total_teacher_attendance_days
    end
  end
end
