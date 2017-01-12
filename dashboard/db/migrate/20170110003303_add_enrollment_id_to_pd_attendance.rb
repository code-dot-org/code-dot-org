class AddEnrollmentIdToPdAttendance < ActiveRecord::Migration[5.0]
  def change
    change_table(:pd_attendances) do |t|
      t.integer :pd_enrollment_id
    end
    change_column_null :pd_attendances, :teacher_id, true

    reversible do |dir|
      dir.up do
        Pd::Attendance.with_deleted.find_each do |attendance|
          enrollment = Pd::Enrollment.with_deleted.where(workshop: attendance.session.workshop, user: attendance.teacher)
          attendance.update(pd_enrollment_id: enrollment.id) if enrollment.id
        end
      end
    end
  end
end
