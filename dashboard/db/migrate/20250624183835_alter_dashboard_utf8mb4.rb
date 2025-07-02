class AlterDashboardUtf8mb4 < ActiveRecord::Migration[6.1]
  def up
    execute "ALTER DATABASE #{CDO.dashboard_db_name} CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;"
  end

  def down
    execute "ALTER DATABASE #{CDO.dashboard_db_name} CHARACTER SET = utf8 COLLATE = utf8_unicode_ci;"
  end
end
