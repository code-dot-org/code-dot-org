class AddDistrictSchoolAndCodeToEnrollment < ActiveRecord::Migration
  def change
    add_column :pd_enrollments, :district_name, :string
    add_column :pd_enrollments, :school, :string
    add_column :pd_enrollments, :code, :string, index: true, unique: true
  end
end
