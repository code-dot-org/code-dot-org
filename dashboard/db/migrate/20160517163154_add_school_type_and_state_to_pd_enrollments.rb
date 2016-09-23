class AddSchoolTypeAndStateToPdEnrollments < ActiveRecord::Migration[4.2]
  def change
    add_column :pd_enrollments, :school_type, :string
    add_column :pd_enrollments, :school_state, :string
  end
end
