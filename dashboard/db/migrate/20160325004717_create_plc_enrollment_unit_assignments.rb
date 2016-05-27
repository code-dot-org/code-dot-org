class CreatePlcEnrollmentUnitAssignments < ActiveRecord::Migration
  def change
    Plc::UserCourseEnrollment.delete_all
    Plc::EnrollmentModuleAssignment.destroy_all

    create_table :plc_enrollment_unit_assignments do |t|
      t.references :plc_user_course_enrollment, index: {name: 'enrollment_unit_assignment_course_enrollment_index'}, foreign_key: true
      t.references :plc_course_unit, index: {name: 'enrollment_unit_assignment_course_unit_index'}, foreign_key: true
      t.string :status

      t.timestamps null: false
    end

    rename_column :plc_enrollment_module_assignments, :plc_user_course_enrollment_id, :plc_enrollment_unit_assignment_id
  end
end
