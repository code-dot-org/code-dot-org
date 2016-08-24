class AddXAndYToLevels < ActiveRecord::Migration[4.2]
  def change
    add_column :levels, :x, :integer
    add_column :levels, :y, :integer
  end
end
