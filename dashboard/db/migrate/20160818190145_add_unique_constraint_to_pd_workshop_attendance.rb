class AddUniqueConstraintToPdWorkshopAttendance < ActiveRecord::Migration
  def up
    duplicate_attendance_values = Pd::Attendance.
      select('pd_session_id, teacher_id, count(*)').
      group(:pd_session_id, :teacher_id).
      having('count(*) > 1').
      pluck(:pd_session_id, :teacher_id)

    # Destroy all but the latest of each set
    duplicate_attendance_values.each do |pd_session_id, teacher_id|
      Pd::Attendance.
        where(pd_session_id: pd_session_id, teacher_id: teacher_id).
        order(id: :desc)[1..-1].
        each(&:destroy)
    end

    # Add unique multi-column index
    add_index :pd_attendances, [:pd_session_id, :teacher_id], unique: true
  end

  def down
    remove_index :pd_attendances, column: [:pd_session_id, :teacher_id]
  end
end
