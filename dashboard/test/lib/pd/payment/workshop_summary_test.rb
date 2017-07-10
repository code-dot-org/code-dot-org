require 'test_helper'

module Pd::Payment
  class WorkshopSummaryTest < ActiveSupport::TestCase
    setup do
      @ended_workshop = create :pd_ended_workshop, num_sessions: 1
      @workshop_summary = WorkshopSummary.new(
        workshop: @ended_workshop,
        pay_period: 'a pay period',
        num_days: 1,
        num_hours: 6,
        min_attendance_days: 1,
        calculator_class: PaymentCalculatorBase,
        attendance_count_per_session: [0]
      )
    end

    test 'section_url' do
      assert_not_nil @workshop_summary.section_url
      assert @workshop_summary.section_url.include? "/teacher-dashboard#/sections/#{@ended_workshop.section_id}"
    end

    test 'section_url is nil when the section is deleted' do
      @ended_workshop.section.destroy!
      @ended_workshop.reload

      assert_nil @workshop_summary.section_url
    end
  end
end
