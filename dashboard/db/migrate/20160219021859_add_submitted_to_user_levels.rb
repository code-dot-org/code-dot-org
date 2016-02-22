class AddSubmittedToUserLevels < ActiveRecord::Migration
  def change
    add_column :user_levels, :submitted, :boolean

    reversible do |change|
      change.up do
        execute('UPDATE user_levels SET submitted = true, best_result = 30 WHERE best_result = 1000')
      end
      change.down do
        execute('UPDATE user_levels SET best_result = 1000 WHERE submitted = true AND best_result = 30')
      end
    end
  end
end
