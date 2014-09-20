class AddBeeGoalsToLevel < ActiveRecord::Migration
  def change
    add_column :levels, :nectar_goal, :integer
    add_column :levels, :honey_goal, :integer
  end
end
