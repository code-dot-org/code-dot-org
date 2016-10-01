require 'test_helper'
require 'cdo/activity_constants'

module Pd::Payment
  class StandardPayTest < ActiveSupport::TestCase
    setup do
      # TIME_CONSTRAINTS_BY_SUBJECT: SUBJECT_ECS_PHASE_4 => {min_days: 2, max_days: 3, max_hours: 18}
      @workshop = create :pd_ended_workshop,
        workshop_type: Pd::Workshop::TYPE_PUBLIC,
        course: Pd::Workshop::COURSE_ECS,
        subject: Pd::Workshop::SUBJECT_ECS_PHASE_4,
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

    test 'small venue non-plp' do
      payment = StandardPay.new @workshop

      assert payment.qualified?
      assert_equal 11, payment.num_teachers
      assert_equal 10, payment.num_qualified_teachers
      assert_equal 29, payment.total_teacher_attendance_days
      assert_equal StandardPay::PAYMENT_VENUE_SMALL_PER_DAY, payment.venue_payment_per_day
      assert_equal 1, payment.plp_multiplier

      expected_payment = {
        food: 1160,
        facilitator: 3000,
        staffer: 750,
        venue: 1200
      }
      assert_equal expected_payment, payment.payment
      assert_equal 6110, payment.payment_total
    end

    test 'large venue plp non-urban' do
      plp = create :professional_learning_partner, contact: @workshop.organizer, urban: false

      # Add an extra qualified teacher to go over the large venue threshold.
      create :pd_workshop_participant, workshop: @workshop,
        enrolled: true, in_section: true, attended: @workshop.sessions

      payment = StandardPay.new @workshop

      assert_equal plp, payment.plp
      assert payment.qualified?
      assert_equal 11, payment.num_qualified_teachers
      assert_equal 32, payment.total_teacher_attendance_days
      assert_equal StandardPay::PAYMENT_VENUE_LARGE_PER_DAY, payment.venue_payment_per_day
      assert_equal 1, payment.plp_multiplier

      expected_payment = {
        food: 1280,
        facilitator: 3000,
        staffer: 750,
        venue: 1350
      }
      assert_equal expected_payment, payment.payment
      assert_equal 6380, payment.payment_total
    end

    test 'small venue plp urban' do
      plp = create :professional_learning_partner, contact: @workshop.organizer, urban: true

      payment = StandardPay.new workshop

      assert_equal plp, payment.plp
      assert payment.qualified?
      assert_equal 10, payment.num_qualified_teachers
      assert_equal 29, payment.total_teacher_attendance_days
      assert_equal StandardPay::PAYMENT_VENUE_SMALL_PER_DAY, payment.venue_payment_per_day
      assert_equal 1.25, payment.plp_multiplier

      expected_payment = {
        food: 1450,
        facilitator: 3000,
        staffer: 937.5,
        venue: 1500
      }
      assert_equal expected_payment, payment.payment
      assert_equal 6887.5, payment.payment_total
    end
  end
end
