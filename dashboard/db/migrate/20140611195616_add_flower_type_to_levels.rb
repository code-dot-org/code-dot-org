class AddFlowerTypeToLevels < ActiveRecord::Migration
  def change
    add_column :levels, :flower_type, :string, :limit => 20
  end
end
