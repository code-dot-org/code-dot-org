require 'test_helper'

class WorkshopAttendanceTest < ActiveSupport::TestCase
  test "has notes" do
    workshop_attendance = create :attendance
    workshop_attendance.notes = "The notes"
    workshop_attendance.save!

    workshop_attendance.reload
    assert_equal 'The notes', workshop_attendance.notes
  end

  test "validates presence of teacher" do
    invalid_attendance = build :attendance, teacher_id: nil
    assert_nil invalid_attendance.teacher_id
    refute invalid_attendance.valid?

    valid_attendance = build :attendance
    refute_nil valid_attendance.teacher_id
    assert valid_attendance.valid?
  end
end
