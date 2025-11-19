class AddScriptToAiLessonSummaryTable < ActiveRecord::Migration[6.1]
  def change
    add_column :ai_lesson_summaries, :script, :text
  end
end
