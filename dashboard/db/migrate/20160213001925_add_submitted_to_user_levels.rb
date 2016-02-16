class AddSubmittedToUserLevels < ActiveRecord::Migration
  def change
    add_column :user_levels, :submitted, :boolean
  end
end
