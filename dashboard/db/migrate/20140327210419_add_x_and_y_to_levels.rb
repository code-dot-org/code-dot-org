class AddXAndYToLevels < ActiveRecord::Migration
  def change
    add_column :levels, :x, :integer
    add_column :levels, :y, :integer
  end
end
