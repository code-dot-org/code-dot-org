class AddStartDirectionToLevels < ActiveRecord::Migration
  def change
    add_column :levels, :start_direction, :string
  end
end
