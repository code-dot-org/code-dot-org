class ConvertAiTutorInteractionsToUtf8mb4 < ActiveRecord::Migration[6.1]
  def change
    reversible do |dir|
      dir.up do
        execute "ALTER TABLE ai_tutor_interactions CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
      end
    end
  end
end
