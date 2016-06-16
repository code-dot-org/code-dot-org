class AddSchoolDistrictOtherToEnrollment < ActiveRecord::Migration
  def change
    add_column :pd_enrollments, :school_district_other, :boolean
  end
end
