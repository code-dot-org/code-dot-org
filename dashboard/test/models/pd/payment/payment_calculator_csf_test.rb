require 'test_helper'
require 'cdo/activity_constants'

module Pd::Payment
  class PaymentCalculatorCSFTest < ActiveSupport::TestCase
    setup do
      @workshop = create :pd_ended_workshop, course: Pd::Workshop::COURSE_CSF, workshop_type: Pd::Workshop::TYPE_PUBLIC

      # >= 10 passing levels: qualified
      @qualified_teacher = create :teacher
      10.times do
        create :user_level, user: @qualified_teacher, best_result: ::ActivityConstants::MINIMUM_PASS_RESULT
      end
      @workshop.section.add_student @qualified_teacher

      # < 10 passing levels: unqualified
      @unqualified_teacher = create :teacher
      9.times do
        create :user_level, user: @unqualified_teacher, best_result: ::ActivityConstants::MINIMUM_PASS_RESULT
      end
      @workshop.section.add_student @unqualified_teacher
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
      summary.teacher_summaries.find{|t| t.teacher == @qualified_teacher}.tap do |teacher_summary|
        assert teacher_summary
        assert teacher_summary.qualified?
        assert_equal 1, teacher_summary.raw_days
        assert_equal 6, teacher_summary.raw_hours
        assert_equal 1, teacher_summary.days
        assert_equal 6, teacher_summary.hours
      end

      # Unqualified
      summary.teacher_summaries.find{|t| t.teacher == @unqualified_teacher}.tap do |teacher_summary|
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

      assert_equal({
        food: 50
      }, payment.amounts)

      assert_equal 50, payment.total
    end
  end
end
