class AddBeeGoalsToLevel < ActiveRecord::Migration[4.2]
  def change
    add_column :levels, :nectar_goal, :integer
    add_column :levels, :honey_goal, :integer
  end
end
