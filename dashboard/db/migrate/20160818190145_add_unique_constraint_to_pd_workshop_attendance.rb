class AddUniqueConstraintToPdWorkshopAttendance < ActiveRecord::Migration[4.2]
  def change
    reversible do |dir|
      dir.up do
        duplicate_attendance_values = Pd::Attendance.with_deleted.
          select('pd_session_id, teacher_id, count(*)').
          group(:pd_session_id, :teacher_id).
          having('count(*) > 1').
          pluck(:pd_session_id, :teacher_id)

        # Destroy all but the latest of each set
        duplicate_attendance_values.each do |pd_session_id, teacher_id|
          Pd::Attendance.with_deleted.
            where(pd_session_id: pd_session_id, teacher_id: teacher_id).
            order(id: :desc)[1..-1].
            each(&:destroy)
        end
      end
    end

    # Add unique multi-column index and remove old single-column index
    change_table :pd_attendances do |t|
      t.index [:pd_session_id, :teacher_id], unique: true
      t.remove_index column: :pd_session_id
    end
  end
end
