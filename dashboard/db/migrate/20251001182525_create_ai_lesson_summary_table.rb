class CreateAiLessonSummaryTable < ActiveRecord::Migration[6.1]
  def change
    create_table :ai_lesson_summaries do |t|
      t.integer :user_id
      t.integer :lesson_id
      t.text :lesson_summary
      t.timestamps
    end
  end
end
