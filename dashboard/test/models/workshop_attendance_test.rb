require 'test_helper'

class WorkshopAttendanceTest < ActiveSupport::TestCase

  test "has notes" do
    workshop_attendance = create :attendance
    workshop_attendance.notes = "The notes"
    workshop_attendance.save!

    workshop_attendance.reload
    assert_equal 'The notes', workshop_attendance.notes
  end
end
