class AddViewAnswersUnlockedAtToUserLevels < ActiveRecord::Migration
  def change
    add_column :user_levels, :readonly_answers, :boolean
    add_column :user_levels, :unlocked_at, :datetime
  end
end
