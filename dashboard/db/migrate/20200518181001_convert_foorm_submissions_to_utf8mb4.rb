class ConvertFoormSubmissionsToUtf8mb4 < ActiveRecord::Migration[5.0]
  def up
    execute "ALTER TABLE foorm_submissions CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_bin"
  end

  def down
    execute "ALTER TABLE foorm_submissions CONVERT TO CHARACTER SET utf8 COLLATE utf8_unicode_ci"
  end
end
