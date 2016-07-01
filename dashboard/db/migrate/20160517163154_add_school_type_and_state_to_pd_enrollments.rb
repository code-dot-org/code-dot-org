class AddSchoolTypeAndStateToPdEnrollments < ActiveRecord::Migration
  def change
    add_column :pd_enrollments, :school_type, :string
    add_column :pd_enrollments, :school_state, :string
  end
end
