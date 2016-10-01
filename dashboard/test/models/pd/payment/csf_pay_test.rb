require 'test_helper'
require 'cdo/activity_constants'

module Pd::Payment
  class CSFPayTest < ActiveSupport::TestCase
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
      payment = CSFPay.new @workshop
      assert_equal 'CSF Facilitator', payment.payment_type
    end

    test 'payment details' do
      payment = CSFPay.new @workshop

      assert payment.qualified?
      assert_equal 2, payment.num_teachers
      assert_equal 1, payment.num_qualified_teachers
      assert_equal [2], payment.attendance_count_per_session

      assert_equal({
        @qualified_teacher.id => 1,
        @unqualified_teacher.id => 1
      }, payment.raw_attendance_days_per_teacher)

      assert_equal({
        @qualified_teacher.id => 0,
        @unqualified_teacher.id => 0
      }, payment.raw_attendance_hours_per_teacher)

      assert_equal({
        @qualified_teacher.id => 1
      }, payment.adjusted_attendance_days_per_teacher)
      assert_equal 1, payment.total_teacher_attendance_days

      assert_equal({
        @qualified_teacher.id => 0
      }, payment.adjusted_attendance_hours_per_teacher)

      assert_equal({
        food: 50
      }, payment.payment)

      assert_equal 50, payment.payment_total
    end
  end
end
