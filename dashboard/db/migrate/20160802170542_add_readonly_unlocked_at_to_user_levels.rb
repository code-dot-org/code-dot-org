class AddReadonlyUnlockedAtToUserLevels < ActiveRecord::Migration
  def change
    add_column :user_levels, :view_answers, :boolean
    add_column :user_levels, :unlocked_at, :datetime
  end
end
