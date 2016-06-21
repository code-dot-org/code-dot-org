class AddSchoolDistrictOtherToEnrollment < ActiveRecord::Migration
  def change
    # school_district_other is true if the user explicitly stated that their
    # district is not in the list provided for their state.
    add_column :pd_enrollments, :school_district_other, :boolean
  end
end
