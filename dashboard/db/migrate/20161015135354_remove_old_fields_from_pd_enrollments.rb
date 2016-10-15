class RemoveOldFieldsFromPdEnrollments < ActiveRecord::Migration[5.0]
  # The 20160824002113_create_school_infos migration moved these fields into SchoolInfo.
  # They are now deprecated in pd_enrollments and can be removed.
  def change
    remove_column :pd_enrollments, :school_type, :string
    remove_column :pd_enrollments, :school_zip, :integer
    remove_column :pd_enrollments, :school_state, :string
    remove_reference :pd_enrollments, :school_district, foreign_key: true
    remove_column :pd_enrollments, :school_district_other, :boolean, default: false
  end
end
