require 'test_helper'
require 'cdo/activity_constants'

# This tests the base payment functionality. Derived classes have more specific tests for the parts they change.

module Pd::Payment
  class BasePayTest < ActiveSupport::TestCase
    test 'public unqualified' do
      empty_workshop = create :pd_ended_workshop,
        workshop_type: Pd::Workshop::TYPE_PUBLIC,
        course: Pd::Workshop::COURSE_CSP,
        subject: Pd::Workshop::SUBJECT_CSP_WORKSHOP_1

      payment = BasePay.new empty_workshop
      assert_equal 0, payment.num_teachers
      refute payment.qualified?
    end

    test 'pay_period' do
      workshop_1 = create :pd_ended_workshop, ended_at: Date.new(2016, 9, 1)
      workshop_15 = create :pd_ended_workshop, ended_at: Date.new(2016, 9, 15)
      workshop_16 = create :pd_ended_workshop, ended_at: Date.new(2016, 9, 16)
      workshop_30 = create :pd_ended_workshop, ended_at: Date.new(2016, 9, 30)

      assert_equal '09/01/2016 - 09/15/2016', BasePay.new(workshop_1).pay_period
      assert_equal '09/01/2016 - 09/15/2016', BasePay.new(workshop_15).pay_period
      assert_equal '09/16/2016 - 09/30/2016', BasePay.new(workshop_16).pay_period
      assert_equal '09/16/2016 - 09/30/2016', BasePay.new(workshop_30).pay_period
    end

    test 'default payment details' do
      payment = BasePay.new create(:pd_ended_workshop)

      # Payment details are supplied in derived classes.
      assert_equal({}, payment.payment)
      assert_equal 0, payment.payment_total
    end

    test 'payment_type and plp' do
      workshop_no_plp = create :pd_ended_workshop

      workshop_plp_urban = create :pd_ended_workshop
      plp_urban = create :professional_learning_partner, contact: workshop_plp_urban.organizer, urban: true

      workshop_plp_non_urban = create :pd_ended_workshop
      plp_non_urban = create :professional_learning_partner, contact: workshop_plp_non_urban.organizer, urban: false

      payment_no_plp = BasePay.new workshop_no_plp
      payment_plp_urban = BasePay.new workshop_plp_urban
      payment_plp_non_urban = BasePay.new workshop_plp_non_urban

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

      payment = BasePay.new(workshop)

      assert payment.qualified?
      assert_equal 3, payment.num_days
      assert_equal 4, payment.num_teachers
      assert_equal 3, payment.num_qualified_teachers

      assert_equal [3, 2, 3, 2], payment.attendance_count_per_session

      assert_equal({
        teacher_below_min_attendance.id => 1,
        teacher_last_2_days.id => 2,
        teacher_first_3_days.id => 3,
        teacher_above_cap.id => 4
      }, payment.raw_attendance_days_per_teacher)

      assert_equal({
        teacher_below_min_attendance.id => 6,
        teacher_last_2_days.id => 12,
        teacher_first_3_days.id => 18,
        teacher_above_cap.id => 24
      }, payment.raw_attendance_hours_per_teacher)

      assert_equal({
        teacher_last_2_days.id => 2,
        teacher_first_3_days.id => 3,
        teacher_above_cap.id => 3
      }, payment.adjusted_attendance_days_per_teacher)

      assert_equal({
        teacher_last_2_days.id => 12,
        teacher_first_3_days.id => 18,
        teacher_above_cap.id => 18
      }, payment.adjusted_attendance_hours_per_teacher)

      assert_equal 8, payment.total_teacher_attendance_days
    end
  end
end
