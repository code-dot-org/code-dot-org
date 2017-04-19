require 'test_helper'
require 'cdo/activity_constants'

module Pd::Payment
  class PaymentCalculatorCSFTest < ActiveSupport::TestCase
    setup do
      @workshop = create :pd_ended_workshop, course: Pd::Workshop::COURSE_CSF, workshop_type: Pd::Workshop::TYPE_PUBLIC

      # >= 10 passing levels: qualified
      @qualified_teacher = create :teacher, :with_puzzles, num_puzzles: 10
      @workshop.section.add_student @qualified_teacher
      create :pd_enrollment, workshop: @workshop, user: @qualified_teacher

      # < 10 passing levels: unqualified
      @unqualified_teacher = create :teacher, :with_puzzles, num_puzzles: 9
      @workshop.section.add_student @unqualified_teacher
      create :pd_enrollment, workshop: @workshop, user: @unqualified_teacher
    end

    test 'payment_type' do
      payment = PaymentCalculatorCSF.instance.calculate(@workshop).payment
      assert_equal 'CSF Facilitator', payment.type
    end

    test 'payment details' do
      summary = PaymentCalculatorCSF.instance.calculate(@workshop)

      assert_equal 2, summary.num_teachers
      assert_equal 1, summary.num_qualified_teachers
      assert_equal [2], summary.attendance_count_per_session

      # Qualified
      summary.teacher_summaries.find {|t| t.teacher == @qualified_teacher}.tap do |teacher_summary|
        assert teacher_summary
        assert teacher_summary.qualified?
        assert_equal 1, teacher_summary.raw_days
        assert_equal 6, teacher_summary.raw_hours
        assert_equal 1, teacher_summary.days
        assert_equal 6, teacher_summary.hours
      end

      # Unqualified
      summary.teacher_summaries.find {|t| t.teacher == @unqualified_teacher}.tap do |teacher_summary|
        assert teacher_summary
        refute teacher_summary.qualified?
        assert_equal 1, teacher_summary.raw_days
        assert_equal 6, teacher_summary.raw_hours
        assert_equal 1, teacher_summary.days
        assert_equal 6, teacher_summary.hours
      end

      assert_equal 1, summary.total_teacher_attendance_days
      assert summary.qualified?
      payment = summary.payment
      assert payment

      assert_equal(
        {food: 50},
        payment.amounts
      )

      assert_equal 50, payment.total
    end

    # Any CSF teacher in the workshop section with a valid enrollment counts as attended.
    # We had an issue where teachers with enrollments from another workshop were in this workshop's
    # section for some reason, and it caused errors. Verify now they are excluded and cause no errors.
    test 'teachers in section with enrollments in another workshop are not counted' do
      external_teacher = create :teacher, :with_puzzles, num_puzzles: 10
      create :pd_enrollment, user: external_teacher
      @workshop.section.add_student external_teacher

      summary = PaymentCalculatorCSF.instance.calculate(@workshop)
      assert_equal 2, summary.num_teachers
      assert_equal 1, summary.num_qualified_teachers
      assert_equal @qualified_teacher, summary.teacher_summaries.find(&:qualified?).teacher
    end
  end
end
