class AddStartDirectionToLevels < ActiveRecord::Migration[4.2]
  def change
    add_column :levels, :start_direction, :string
  end
end
