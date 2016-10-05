require 'test_helper'
require 'cdo/activity_constants'

# This tests the base payment functionality. Derived classes have more specific tests for the parts they change.

module Pd::Payment
  class PaymentCalculatorBaseTest < ActiveSupport::TestCase
    test 'public unqualified' do
      empty_workshop = create :pd_ended_workshop,
        workshop_type: Pd::Workshop::TYPE_PUBLIC,
        course: Pd::Workshop::COURSE_CSP,
        subject: Pd::Workshop::SUBJECT_CSP_WORKSHOP_1

      payment = PaymentCalculatorBase.instance.calculate empty_workshop
      assert_equal 0, payment.num_teachers
      refute payment.qualified
    end

    test 'pay_period' do
      workshop_1 = create :pd_ended_workshop, ended_at: Date.new(2016, 9, 1)
      workshop_15 = create :pd_ended_workshop, ended_at: Date.new(2016, 9, 15)
      workshop_16 = create :pd_ended_workshop, ended_at: Date.new(2016, 9, 16)
      workshop_30 = create :pd_ended_workshop, ended_at: Date.new(2016, 9, 30)

      assert_equal '09/01/2016 - 09/15/2016', PaymentCalculatorBase.instance.get_pay_period(workshop_1)
      assert_equal '09/01/2016 - 09/15/2016', PaymentCalculatorBase.instance.get_pay_period(workshop_15)
      assert_equal '09/16/2016 - 09/30/2016', PaymentCalculatorBase.instance.get_pay_period(workshop_16)
      assert_equal '09/16/2016 - 09/30/2016', PaymentCalculatorBase.instance.get_pay_period(workshop_30)
    end

    test 'default payment details' do
      workshop = create(:pd_ended_workshop)
      payment = PaymentCalculatorBase.instance.calculate(workshop)

      # Payment details are supplied in derived classes.
      assert_equal({}, payment.payment_amounts)
      assert_equal 0, payment.payment_total
    end

    test 'payment_type and plp' do
      workshop_no_plp = create :pd_ended_workshop

      workshop_plp_urban = create :pd_ended_workshop
      plp_urban = create :professional_learning_partner, contact: workshop_plp_urban.organizer, urban: true

      workshop_plp_non_urban = create :pd_ended_workshop
      plp_non_urban = create :professional_learning_partner, contact: workshop_plp_non_urban.organizer, urban: false

      payment_no_plp = PaymentCalculatorBase.instance.calculate workshop_no_plp
      payment_plp_urban = PaymentCalculatorBase.instance.calculate workshop_plp_urban
      payment_plp_non_urban = PaymentCalculatorBase.instance.calculate workshop_plp_non_urban

      assert_nil payment_no_plp.plp
      assert_equal plp_urban, payment_plp_urban.plp
      assert_equal plp_non_urban, payment_plp_non_urban.plp

      assert_nil payment_no_plp.payment_type
      assert_equal 'PLP Urban', payment_plp_urban.payment_type
      assert_equal 'PLP Non-urban', payment_plp_non_urban.payment_type
    end

    test 'attendance' do
      # Create a workshop with 4 sessions, which will be capped at 3
      # TIME_CONSTRAINTS_BY_SUBJECT: SUBJECT_ECS_PHASE_4 => {min_days: 2, max_days: 3, max_hours: 18}
      workshop = create :pd_ended_workshop,
        workshop_type: Pd::Workshop::TYPE_PUBLIC,
        course: Pd::Workshop::COURSE_ECS,
        subject: Pd::Workshop::SUBJECT_ECS_PHASE_4,
        num_sessions: 4

      # Attend 1 section, below min. Should count as 0.
      teacher_below_min_attendance = create :pd_workshop_participant, workshop: workshop,
        enrolled: true, in_section: true, attended: [workshop.sessions.first]

      teacher_last_2_days = create :pd_workshop_participant, workshop: workshop,
        enrolled: true, in_section: true, attended: workshop.sessions.last(2)

      teacher_first_3_days = create :pd_workshop_participant, workshop: workshop,
        enrolled: true, in_section: true, attended: workshop.sessions.first(3)

      # Attend all sessions. Should be capped at 3.
      teacher_above_cap = create :pd_workshop_participant, workshop: workshop,
        enrolled: true, in_section: true, attended: workshop.sessions

      payment = PaymentCalculatorBase.instance.calculate workshop

      assert payment.qualified
      assert_equal 3, payment.num_days
      assert_equal 4, payment.num_teachers
      assert_equal 3, payment.num_qualified_teachers

      assert_equal [3, 2, 3, 2], payment.attendance_count_per_session

      assert_equal({
        teacher_below_min_attendance.id => TeacherAttendanceTotal.new(1, 6),
        teacher_last_2_days.id => TeacherAttendanceTotal.new(2, 12),
        teacher_first_3_days.id => TeacherAttendanceTotal.new(3, 18),
        teacher_above_cap.id => TeacherAttendanceTotal.new(4, 24)
      }, payment.raw_teacher_attendance)

      assert_equal({
        teacher_last_2_days.id => TeacherAttendanceTotal.new(2, 12),
        teacher_first_3_days.id => TeacherAttendanceTotal.new(3, 18),
        teacher_above_cap.id => TeacherAttendanceTotal.new(3, 18)
      }, payment.adjusted_teacher_attendance)

      assert_equal 8, payment.total_teacher_attendance_days
    end
  end
end
