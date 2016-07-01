class SchoolDistrictsNotNull < ActiveRecord::Migration
  def change
    change_column :school_districts, :name, :string, null: false
    change_column :school_districts, :city, :string, null: false
    change_column :school_districts, :state, :string, null: false
    change_column :school_districts, :zip, :string, null: false
  end
end
