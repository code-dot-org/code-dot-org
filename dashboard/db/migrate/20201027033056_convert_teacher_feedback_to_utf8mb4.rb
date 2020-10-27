class ConvertTeacherFeedbackToUtf8mb4 < ActiveRecord::Migration[5.0]
  def up
    execute 'alter table teacher_feedbacks convert to charset utf8mb4 collate utf8mb4_unicode_ci'
  end

  def down
    execute 'alter table teacher_feedbacks convert to charset utf8 collate utf8_unicode_ci'
  end
end
