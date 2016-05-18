class AddSubmittedToUserLevels < ActiveRecord::Migration
  def up
    execute('ALTER IGNORE TABLE user_levels add submitted tinyint(1)')
    execute('UPDATE user_levels SET submitted = true, best_result = 30 WHERE best_result = 1000')
  end

  def down
    execute('UPDATE user_levels SET best_result = 1000 WHERE submitted = true AND best_result = 30')
    execute('ALTER IGNORE TABLE user_levels DROP COLUMN submitted')
  end
end
