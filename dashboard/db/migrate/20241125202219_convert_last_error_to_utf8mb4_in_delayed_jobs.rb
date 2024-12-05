class ConvertLastErrorToUtf8mb4InDelayedJobs < ActiveRecord::Migration[6.1]
  def up
    execute 'alter table delayed_jobs modify last_error mediumtext charset utf8mb4 collate utf8mb4_unicode_ci'
  end

  def down
    execute 'alter table delayed_jobs modify last_error mediumtext charset utf8 collate utf8_unicode_ci'
  end
end
