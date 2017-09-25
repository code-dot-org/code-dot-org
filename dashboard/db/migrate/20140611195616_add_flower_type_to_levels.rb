class AddFlowerTypeToLevels < ActiveRecord::Migration[4.2]
  def change
    add_column :levels, :flower_type, :string, limit: 20
  end
end
