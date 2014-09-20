class AddIsK1ToLevels < ActiveRecord::Migration
  def change
    add_column :levels, :is_k1, :boolean
  end
end
