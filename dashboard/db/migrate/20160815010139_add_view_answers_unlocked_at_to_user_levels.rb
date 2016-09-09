class AddViewAnswersUnlockedAtToUserLevels < ActiveRecord::Migration[4.2]
  def change
    ActiveRecord::Base.record_timestamps = false
    begin
      add_column :user_levels, :readonly_answers, :boolean
      add_column :user_levels, :unlocked_at, :datetime
    ensure
      ActiveRecord::Base.record_timestamps = true
    end
  end
end
