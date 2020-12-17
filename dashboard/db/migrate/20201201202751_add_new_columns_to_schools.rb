class AddNewColumnsToSchools < ActiveRecord::Migration[5.2]
  def change
    add_column :schools, :school_category, :string
    add_column :schools, :last_known_school_year_open, :string, limit: 9
    add_index :schools, :last_known_school_year_open

    add_column :school_districts, :last_known_school_year_open, :string, limit: 9, after: :zip
  end
end
