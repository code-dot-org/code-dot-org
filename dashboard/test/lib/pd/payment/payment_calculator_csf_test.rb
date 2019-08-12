require 'test_helper'
require 'cdo/activity_constants'

module Pd::Payment
  class PaymentCalculatorCSFTest < ActiveSupport::TestCase
    self.use_transactional_test_case = true
    setup_all do
      @workshop = create :workshop, :ended, :funded, course: Pd::Workshop::COURSE_CSF, on_map: true
      session = @workshop.sessions.first

      # >= 10 passing levels: qualified
      @qualified_teacher = create :teacher, :with_puzzles, num_puzzles: 10
      qualified_enrollment = create :pd_enrollment, workshop: @workshop, user: @qualified_teacher
      create :pd_attendance, session: session, teacher: @qualified_teacher, enrollment: qualified_enrollment

      # < 10 passing levels: unqualified
      @unqualified_teacher = create :teacher, :with_puzzles, num_puzzles: 9
      unqualified_enrollment = create :pd_enrollment, workshop: @workshop, user: @unqualified_teacher
      create :pd_attendance, session: session, teacher: @unqualified_teacher, enrollment: unqualified_enrollment
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
  end
end
