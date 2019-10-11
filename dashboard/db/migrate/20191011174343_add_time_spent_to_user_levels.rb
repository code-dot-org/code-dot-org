class AddTimeSpentToUserLevels < ActiveRecord::Migration[5.0]
  def change
    add_column :user_levels, :time_spent, :integer
  end
end
