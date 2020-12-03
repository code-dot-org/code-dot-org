class AddNewColumnsToSchools < ActiveRecord::Migration[5.2]
  def change
    add_column :schools, :school_category, :string
    add_column :schools, :last_known_year_open, :integer
    add_index :schools, :last_known_year_open
  end
end
