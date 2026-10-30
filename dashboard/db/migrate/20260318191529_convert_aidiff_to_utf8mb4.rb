class ConvertAidiffToUtf8mb4 < ActiveRecord::Migration[7.0]
  def change
    reversible do |dir|
      dir.up do
        execute "ALTER TABLE aidiff_messages CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
        execute "ALTER TABLE aidiff_threads CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
      end
      dir.down do
        execute "ALTER TABLE aidiff_messages CONVERT TO CHARACTER SET utf8 COLLATE utf8_unicode_ci"
        execute "ALTER TABLE aidiff_threads CONVERT TO CHARACTER SET utf8 COLLATE utf8_unicode_ci"
      end
    end
  end
end
