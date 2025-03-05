class AddCountyToSchool < ActiveRecord::Migration[6.1]
  def change
    add_column :schools, :county_id, :string
    add_column :schools, :county_name, :string
  end
end
