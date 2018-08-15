class ChangeBlocksToUtf8mb4 < ActiveRecord::Migration[5.0]
  def up
    execute 'alter table blocks convert to charset utf8mb4 collate utf8mb4_unicode_ci'
    execute 'alter table blocks modify name varchar(255) charset utf8mb4 collate utf8mb4_unicode_ci'
    execute 'alter table blocks modify category varchar(255) charset utf8mb4 collate utf8mb4_unicode_ci'
    execute 'alter table blocks modify config text(16383) charset utf8mb4 collate utf8mb4_unicode_ci'
    execute 'alter table blocks modify helper_code text(16383) charset utf8mb4 collate utf8mb4_unicode_ci'
  end

  def down
    execute 'alter table blocks convert to charset utf8 collate utf8_unicode_ci'
    execute 'alter table blocks modify name varchar(255) charset utf8 collate utf8_unicode_ci'
    execute 'alter table blocks modify category varchar(255) charset utf8 collate utf8_unicode_ci'
    execute 'alter table blocks modify config text(21845) charset utf8 collate utf8_unicode_ci'
    execute 'alter table blocks modify helper_code text(21845) charset utf8 collate utf8_unicode_ci'
  end
end
