class AddEnrollmentIdToPdAttendance < ActiveRecord::Migration[5.0]
  def change
    add_reference :pd_attendances, :pd_enrollment
    change_column_null :pd_attendances, :teacher_id, true

    reversible do |dir|
      dir.up do
        Pd::Attendance.reset_column_information
        Pd::Attendance.with_deleted.find_each do |attendance|
          enrollment = Pd::Enrollment.with_deleted.find_by(workshop: attendance.session.workshop, user: attendance.teacher)
          attendance.update!(pd_enrollment_id: enrollment.id) if enrollment
        end
      end
    end
  end
end
