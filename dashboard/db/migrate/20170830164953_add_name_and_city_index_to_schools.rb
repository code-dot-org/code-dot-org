class AddNameAndCityIndexToSchools < ActiveRecord::Migration[5.0]
  def change
    add_index :schools, :name
    add_index :schools, :city
  end
end
