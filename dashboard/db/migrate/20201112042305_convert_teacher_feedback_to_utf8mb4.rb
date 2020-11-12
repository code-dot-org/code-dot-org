class ConvertTeacherFeedbackToUtf8mb4 < ActiveRecord::Migration[5.1]
  def up
    execute 'alter table teacher_feedbacks convert to charset utf8mb4 collate utf8mb4_unicode_ci'
    change_column :teacher_feedbacks, :comment, :text, limit: 65535
  end

  def down
    execute 'alter table teacher_feedbacks convert to charset utf8 collate utf8_unicode_ci'
  end
end
