class AddIsCurrentToSchools < ActiveRecord::Migration[6.1]
  def change
    add_column :schools, :is_current, :boolean
    add_index :schools, :is_current
  end
end
