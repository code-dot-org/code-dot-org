class AddLatitudeAndLongitudeToSchools < ActiveRecord::Migration[5.0]
  def change
    add_column :schools, :latitude, :decimal, precision: 8, scale: 6, comment: "Location latitude"
    add_column :schools, :longitude, :decimal, precision: 9, scale: 6, comment: "Location longitude"
  end
end
