require 'test_helper'

# This tests the base payment functionality. Derived classes have more specific tests for the parts they change.

module Pd::Payment
  class PaymentCalculatorBaseTest < ActiveSupport::TestCase
    test 'public unqualified' do
      empty_workshop = create :csp_academic_year_workshop, :ended, on_map: true, funded: true

      workshop_summary = PaymentCalculatorBase.instance.calculate empty_workshop
      assert_equal 0, workshop_summary.num_teachers
      assert_nil workshop_summary.payment
    end

    test 'pay_period' do
      workshop_1 = create :workshop, :ended, ended_at: Date.new(2016, 9, 1)
      workshop_15 = create :workshop, :ended, ended_at: Date.new(2016, 9, 15)
      workshop_16 = create :workshop, :ended, ended_at: Date.new(2016, 9, 16)
      workshop_30 = create :workshop, :ended, ended_at: Date.new(2016, 9, 30)

      assert_equal '09/01/2016 - 09/15/2016', PaymentCalculatorBase.instance.get_pay_period(workshop_1)
      assert_equal '09/01/2016 - 09/15/2016', PaymentCalculatorBase.instance.get_pay_period(workshop_15)
      assert_equal '09/16/2016 - 09/30/2016', PaymentCalculatorBase.instance.get_pay_period(workshop_16)
      assert_equal '09/16/2016 - 09/30/2016', PaymentCalculatorBase.instance.get_pay_period(workshop_30)
    end

    test 'workshop payment type and regional_partner' do
      workshop_no_regional_partner = create :workshop, :ended
      create :pd_workshop_participant, workshop: workshop_no_regional_partner, enrolled: true, attended: true

      regional_partner_urban = create :regional_partner, urban: true
      program_manager_urban = (create :regional_partner_program_manager, regional_partner: regional_partner_urban).program_manager
      workshop_regional_partner_urban = create :workshop, :ended, organizer: program_manager_urban
      create :pd_workshop_participant, workshop: workshop_regional_partner_urban, enrolled: true, attended: true

      regional_partner_non_urban = create :regional_partner, urban: false
      program_manager_non_urban = (create :regional_partner_program_manager, regional_partner: regional_partner_non_urban).program_manager
      workshop_regional_partner_non_urban = create :workshop, :ended, organizer: program_manager_non_urban
      create :pd_workshop_participant, workshop: workshop_regional_partner_non_urban, enrolled: true, attended: true

      regional_partner_nil_urban = create :regional_partner, urban: nil
      program_manager_nil_urban = (create :regional_partner_program_manager, regional_partner: regional_partner_nil_urban).program_manager
      workshop_regional_partner_nil_urban = create :workshop, :ended, organizer: program_manager_nil_urban
      create :pd_workshop_participant, workshop: workshop_regional_partner_nil_urban, enrolled: true, attended: true

      summary_no_regional_partner = PaymentCalculatorBase.instance.calculate workshop_no_regional_partner
      summary_regional_partner_urban = PaymentCalculatorBase.instance.calculate workshop_regional_partner_urban
      summary_regional_partner_non_urban = PaymentCalculatorBase.instance.calculate workshop_regional_partner_non_urban
      summary_regional_partner_nil_urban = PaymentCalculatorBase.instance.calculate workshop_regional_partner_nil_urban

      assert_nil summary_no_regional_partner.workshop.regional_partner
      assert_nil summary_no_regional_partner.payment.type

      assert_equal regional_partner_urban, summary_regional_partner_urban.workshop.regional_partner
      assert summary_regional_partner_urban.payment
      assert_equal summary_regional_partner_urban, summary_regional_partner_urban.payment.summary
      assert_equal 'PLP Urban', summary_regional_partner_urban.payment.type

      assert_equal regional_partner_non_urban, summary_regional_partner_non_urban.workshop.regional_partner
      assert summary_regional_partner_non_urban.payment
      assert_equal summary_regional_partner_non_urban, summary_regional_partner_non_urban.payment.summary
      assert_equal 'PLP Non-urban', summary_regional_partner_non_urban.payment.type

      assert_equal regional_partner_nil_urban, summary_regional_partner_nil_urban.workshop.regional_partner
      assert summary_regional_partner_nil_urban.payment
      assert_equal summary_regional_partner_nil_urban, summary_regional_partner_nil_urban.payment.summary
      assert_equal 'PLP Non-urban', summary_regional_partner_nil_urban.payment.type
    end

    test 'attendance' do
      # Create a workshop with 4 sessions, which will be capped at 3
      # TIME_CONSTRAINTS: COURSE_ECS => {SUBJECT_ECS_PHASE_4 => {min_days: 2, max_days: 3, max_hours: 18}}
      workshop = create :workshop, :ended,
        on_map: true, funded: true,
        course: Pd::Workshop::COURSE_ECS,
        subject: Pd::Workshop::SUBJECT_ECS_PHASE_4,
        num_sessions: 4

      # Attend 1 session, below min. Should count as 0.
      teacher_below_min_attendance = create :pd_workshop_participant, workshop: workshop,
        enrolled: true, attended: [workshop.sessions.first]

      teacher_last_2_days = create :pd_workshop_participant, workshop: workshop,
        enrolled: true, attended: workshop.sessions.last(2)

      teacher_first_3_days = create :pd_workshop_participant, workshop: workshop,
        enrolled: true, attended: workshop.sessions.first(3)

      # Attend all sessions. Should be capped at 3.
      teacher_above_cap = create :pd_workshop_participant, workshop: workshop,
        enrolled: true, attended: workshop.sessions

      workshop_summary = PaymentCalculatorBase.instance.calculate workshop

      assert workshop_summary.qualified?
      assert_equal 3, workshop_summary.num_days
      assert_equal 4, workshop_summary.num_teachers
      assert_equal 3, workshop_summary.num_qualified_teachers

      assert_equal [3, 2, 3, 2], workshop_summary.attendance_count_per_session
      assert_equal 4, workshop_summary.teacher_summaries.count

      # Below min attendance
      workshop_summary.teacher_summaries.find {|t| t.teacher == teacher_below_min_attendance}.tap do |teacher_summary|
        assert teacher_summary
        assert_equal workshop_summary, teacher_summary.workshop_summary
        assert_equal 1, teacher_summary.raw_days
        assert_equal 6, teacher_summary.raw_hours
        assert_equal 0, teacher_summary.days
        assert_equal 0, teacher_summary.hours
      end

      # Attend 2 days
      workshop_summary.teacher_summaries.find {|t| t.teacher == teacher_last_2_days}.tap do |teacher_summary|
        assert teacher_summary
        assert_equal workshop_summary, teacher_summary.workshop_summary
        assert_equal 2, teacher_summary.raw_days
        assert_equal 12, teacher_summary.raw_hours
        assert_equal 2, teacher_summary.days
        assert_equal 12, teacher_summary.hours
      end

      # Attend 3 days
      workshop_summary.teacher_summaries.find {|t| t.teacher == teacher_first_3_days}.tap do |teacher_summary|
        assert teacher_summary
        assert_equal workshop_summary, teacher_summary.workshop_summary
        assert_equal 3, teacher_summary.raw_days
        assert_equal 18, teacher_summary.raw_hours
        assert_equal 3, teacher_summary.days
        assert_equal 18, teacher_summary.hours
      end

      # Above max attendance
      workshop_summary.teacher_summaries.find {|t| t.teacher == teacher_above_cap}.tap do |teacher_summary|
        assert teacher_summary
        assert_equal workshop_summary, teacher_summary.workshop_summary
        assert_equal 4, teacher_summary.raw_days
        assert_equal 24, teacher_summary.raw_hours
        assert_equal 3, teacher_summary.days
        assert_equal 18, teacher_summary.hours
      end

      assert_equal 8, workshop_summary.total_teacher_attendance_days
    end

    test 'teacher summaries' do
      workshop = create :summer_workshop, :ended, num_sessions: 2, each_session_hours: 6

      teacher_unqualified = create :pd_workshop_participant,
        workshop: workshop, enrolled: true, attended: true
      enrollment_unqualified = Pd::Enrollment.last

      teacher_no_pay = create :pd_workshop_participant,
        workshop: workshop, enrolled: true, attended: true

      teacher_hourly = create :pd_workshop_participant,
        workshop: workshop, enrolled: true, attended: true
      district_hourly = Pd::Enrollment.last.school_info.school_district
      term_hourly = create :pd_district_payment_term, course: workshop.course, school_district: district_hourly,
        rate_type: Pd::DistrictPaymentTerm::RATE_HOURLY, rate: 2

      teacher_daily = create :pd_workshop_participant,
        workshop: workshop, enrolled: true, attended: true
      district_daily = Pd::Enrollment.last.school_info.school_district
      term_daily = create :pd_district_payment_term, course: workshop.course, school_district: district_daily,
        rate_type: Pd::DistrictPaymentTerm::RATE_DAILY, rate: 10

      calculator = PaymentCalculatorBase.instance
      calculator.stubs(:teacher_qualified?).returns true
      calculator.expects(:teacher_qualified?).with(enrollment_unqualified).returns false

      workshop_summary = calculator.calculate(workshop)
      teacher_summaries = workshop_summary.teacher_summaries
      assert teacher_summaries
      assert_equal 4, teacher_summaries.count

      # Unqualified
      teacher_summaries.find {|p| p.teacher == teacher_unqualified}.tap do |teacher_summary|
        refute teacher_summary.qualified?
        assert_equal 2, teacher_summary.days
        assert_equal 12, teacher_summary.hours
        assert_nil teacher_summary.payment
      end

      # No pay
      teacher_summaries.find {|p| p.teacher == teacher_no_pay}.tap do |teacher_summary|
        assert teacher_summary.qualified?
        assert_equal 2, teacher_summary.days
        assert_equal 12, teacher_summary.hours
        assert teacher_summary.payment
        assert_equal teacher_summary, teacher_summary.payment.summary
        assert_nil teacher_summary.payment.district_payment_term
        assert_equal 0, teacher_summary.payment.amount
      end

      # Hourly pay
      teacher_summaries.find {|p| p.teacher == teacher_hourly}.tap do |teacher_summary|
        assert teacher_summary.qualified?
        assert_equal 2, teacher_summary.days
        assert_equal 12, teacher_summary.hours
        assert teacher_summary.payment
        assert_equal teacher_summary, teacher_summary.payment.summary
        assert term_hourly, teacher_summary.payment.district_payment_term
        assert_equal 24, teacher_summary.payment.amount
      end

      # Daily pay
      teacher_summaries.find {|p| p.teacher == teacher_daily}.tap do |teacher_summary|
        assert teacher_summary.qualified?
        assert_equal 2, teacher_summary.days
        assert_equal 12, teacher_summary.hours
        assert teacher_summary.payment
        assert_equal teacher_summary, teacher_summary.payment.summary
        assert term_daily, teacher_summary.payment.district_payment_term
        assert_equal 20, teacher_summary.payment.amount
      end

      assert_equal 6, workshop_summary.total_teacher_attendance_days
    end

    test 'teacher summaries with deleted teacher account' do
      workshop = create :workshop, :ended

      pd_workshop_participant = create :pd_workshop_participant,
        workshop: workshop,
        enrolled: true,
        attended: true
      pd_workshop_participant.destroy

      calculator = PaymentCalculatorBase.instance

      workshop_summary = calculator.calculate(workshop)
      teacher_summaries = workshop_summary.teacher_summaries
      assert teacher_summaries
      assert_equal 1, teacher_summaries.count

      teacher_summaries.first.tap do |teacher_summary|
        assert teacher_summary.qualified?
        assert_equal 1, teacher_summary.days
        assert_equal 6, teacher_summary.hours
        assert_not_nil teacher_summary.payment
      end

      assert_equal 1, workshop_summary.total_teacher_attendance_days
    end

    test 'unexpected payment term' do
      workshop = create :workshop, :ended
      create :pd_workshop_participant,
        workshop: workshop, enrolled: true, attended: true
      Pd::Enrollment.last.school_info.school_district

      mock_term = stub(id: 1, rate: 1, rate_type: 'invalid')
      Pd::DistrictPaymentTerm.expects(find_by: mock_term)

      e = assert_raises do
        PaymentCalculatorBase.instance.calculate(workshop)
      end
      assert e.message.start_with? 'Unexpected district payment term rate type'
    end

    test 'late-deleted enrollments with attendance still show up' do
      workshop = create :workshop, :ended

      pd_workshop_participant = create :pd_workshop_participant,
        workshop: workshop,
        enrolled: true,
        attended: true
      enrollment = Pd::Enrollment.find_by(user: pd_workshop_participant)
      enrollment.destroy

      calculator = PaymentCalculatorBase.instance

      workshop_summary = calculator.calculate(workshop)
      teacher_summaries = workshop_summary.teacher_summaries
      assert teacher_summaries
      assert_equal 1, teacher_summaries.count
      assert_equal enrollment, teacher_summaries.first.enrollment
    end
  end
end
