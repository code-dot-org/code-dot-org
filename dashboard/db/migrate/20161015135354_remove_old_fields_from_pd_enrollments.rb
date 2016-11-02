class RemoveOldFieldsFromPdEnrollments < ActiveRecord::Migration[5.0]
  # The 20160824002113_create_school_infos migration moved these fields into SchoolInfo.
  # They are now deprecated in pd_enrollments and can be removed.
  #
  # Note some of these columns don't exist on staging, due to an earlier failed migration attempt.
  # Each one is now conditionally removed only when it exists.
  # Due to the conditionals this migration will not recreate the columns on rollback.
  def change
    remove_column :pd_enrollments, :school_type, :string if column_exists?(:pd_enrollments, :school_type)
    remove_column :pd_enrollments, :school_zip, :integer if column_exists?(:pd_enrollments, :school_zip)
    remove_column :pd_enrollments, :school_state, :string if column_exists?(:pd_enrollments, :school_state)
    remove_reference :pd_enrollments, :school_district, foreign_key: true if column_exists?(:pd_enrollments, :school_district_id)
  end
end
