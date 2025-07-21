require 'test_helper'

module Pd::Summary
  class TeacherSummaryTest < ActiveSupport::TestCase
    setup do
      @workshop = create :workshop, :ended, enrolled_and_attending_users: 1, enrolled_absent_users: 1, num_sessions: 2
      @enrollment = @workshop.enrollments.first
      @teacher_summary = TeacherSummary.new(enrollment: @enrollment)
    end

    test 'teacher attributes are set correctly' do
      assert_equal @enrollment.user, @teacher_summary.teacher
      assert_equal @enrollment, @teacher_summary.enrollment
    end

    test 'school, district, and state are returned correctly' do
      assert_equal @enrollment.school_name, @teacher_summary.school
      assert_equal @enrollment.school_info&.school_district, @teacher_summary.school_district
      assert_equal @enrollment.school_info&.state, @teacher_summary.state
    end

    test 'calculate_teacher_attendance returns correct days and hours' do
      attendance = @teacher_summary.calculate_teacher_attendance
      assert_kind_of TeacherSummary::TeacherAttendanceTotal, attendance
      assert_equal attendance.days, 2
      assert_equal attendance.hours, 12
    end

    test 'calculate_teacher_attendance returns correct days and hours for teachers without accounts' do
      @enrollment.update(user_id: nil)
      attendance = @teacher_summary.calculate_teacher_attendance
      assert_kind_of TeacherSummary::TeacherAttendanceTotal, attendance
      assert_equal attendance.days, 2
      assert_equal attendance.hours, 12
    end

    test 'generate_teacher_summary_line_item returns expected summary' do
      line_item = @teacher_summary.generate_teacher_summary_line_item
      assert_equal @enrollment.first_name, line_item[:teacher_first_name]
      assert_equal @enrollment.last_name, line_item[:teacher_last_name]
      assert_equal @enrollment.user&.id, line_item[:teacher_id]
      assert_equal @enrollment.email, line_item[:teacher_email]
      assert_equal @workshop.regional_partner.try(:name), line_item[:plp_name]
      assert_equal @enrollment.school_info&.state, line_item[:state]
      assert_equal @enrollment.school_info&.school_district&.name, line_item[:district_name]
      assert_equal @enrollment.school_info&.school_district&.id, line_item[:district_id]
      assert_equal @enrollment.school_name, line_item[:school]
      assert_equal @workshop.course, line_item[:course]
      assert_equal @workshop.subject, line_item[:subject]
      assert_equal @workshop.id, line_item[:workshop_id]
      assert_equal @workshop.friendly_name, line_item[:workshop_name]
      assert_equal @workshop.organizer&.name, line_item[:organizer_name]
      assert_equal @workshop.organizer&.email, line_item[:organizer_email]
      assert_equal @workshop.year, line_item[:year]
      assert_kind_of Numeric, line_item[:hours]
      assert_kind_of Numeric, line_item[:days]
      assert_kind_of String, line_item[:workshop_dates]
      assert line_item[:workshop_dates].present?
    end

    test 'handles missing organizer gracefully' do
      @workshop.organizer.destroy
      @workshop.reload
      teacher_summary = TeacherSummary.new(enrollment: @enrollment.reload)
      line_item = teacher_summary.generate_teacher_summary_line_item
      assert_nil line_item[:organizer_name]
      assert_nil line_item[:organizer_email]
    end
  end
end
