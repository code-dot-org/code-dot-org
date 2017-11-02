class ChangeSchoolDistrictIdToNullInSchools < ActiveRecord::Migration[5.0]
  def change
    change_column_null :schools, :school_district_id, true
  end
end
