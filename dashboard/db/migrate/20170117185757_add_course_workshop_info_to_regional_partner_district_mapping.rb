class AddCourseWorkshopInfoToRegionalPartnerDistrictMapping < ActiveRecord::Migration[5.0]
  def change
    add_column :regional_partners_school_districts, :course, :string
    add_column :regional_partners_school_districts, :workshop_info, :string
  end
end
