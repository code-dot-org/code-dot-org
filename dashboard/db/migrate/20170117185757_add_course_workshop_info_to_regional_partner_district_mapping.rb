class AddCourseWorkshopInfoToRegionalPartnerDistrictMapping < ActiveRecord::Migration[5.0]
  def change
    add_column :regional_partners_school_districts, :course, :string, comment: 'Course for a given workshop'
    add_column :regional_partners_school_districts, :workshop_days, :string, comment: 'Days that the workshop will take place'
  end
end
