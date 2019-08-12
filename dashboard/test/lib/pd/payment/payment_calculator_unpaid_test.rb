require 'test_helper'

module Pd::Payment
  class PaymentCalculatorUnpaidTest < ActiveSupport::TestCase
    setup do
      @workshop = create :workshop,
        :ended,
        funded: true,
        on_map: true,
        course: Pd::Workshop::COURSE_CSD,
        num_sessions: 2,
        num_facilitators: 2

      # 10 qualified teachers: 1 at partial (1 day) attendance, and 9 more at full (2 days) attendance
      create :pd_workshop_participant, workshop: @workshop,
        enrolled: true, attended: @workshop.sessions.first(1)

      create_list :pd_workshop_participant, 9, workshop: @workshop,
          enrolled: true, attended: @workshop.sessions
    end

    test 'unpaid summary' do
      workshop_summary = PaymentCalculatorUnpaid.instance.calculate(@workshop)

      assert_equal 10, workshop_summary.num_teachers
      assert_equal 10, workshop_summary.num_qualified_teachers
      assert_equal 19, workshop_summary.total_teacher_attendance_days

      refute workshop_summary.qualified?
      assert_nil workshop_summary.payment
    end
  end
end
