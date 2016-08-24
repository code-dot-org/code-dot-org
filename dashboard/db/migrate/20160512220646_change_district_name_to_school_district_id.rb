class ChangeDistrictNameToSchoolDistrictId < ActiveRecord::Migration[4.2]
  def change
    add_reference :pd_enrollments, :school_district, index: true, foreign_key: true
    add_column :pd_enrollments, :school_zip, :integer
    remove_column :pd_enrollments, :district_name, :string
  end
end
