class ConvertColumnToUtf8mb4 < ActiveRecord::Migration[5.2]
  def up
    execute "ALTER TABLE levels MODIFY properties LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_520_ci"
  end

  def down
    execute "ALTER TABLE levels MODIFY properties LONGTEXT CHARACTER SET utf8 COLLATE utf8_unicode_ci"
  end
end
