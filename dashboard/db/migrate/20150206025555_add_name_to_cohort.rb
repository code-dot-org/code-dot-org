class AddNameToCohort < ActiveRecord::Migration[4.2]
  def change
    add_column :cohorts, :name, :string
    add_index :cohorts, :name
  end
end
