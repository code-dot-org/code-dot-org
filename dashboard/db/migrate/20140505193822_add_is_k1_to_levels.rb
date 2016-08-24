class AddIsK1ToLevels < ActiveRecord::Migration[4.2]
  def change
    add_column :levels, :is_k1, :boolean
  end
end
