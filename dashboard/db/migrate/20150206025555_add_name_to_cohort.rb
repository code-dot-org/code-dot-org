class AddNameToCohort < ActiveRecord::Migration
  def change
    add_column :cohorts, :name, :string
    add_index :cohorts, :name
  end
end
