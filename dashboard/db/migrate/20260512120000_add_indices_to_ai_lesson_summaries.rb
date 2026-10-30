class AddIndicesToAiLessonSummaries < ActiveRecord::Migration[6.1]
  def change
    # Most queries filter by both user_id and lesson_id (controller lookups,
    # find_or_create_by). Leftmost prefix also covers has_many :ai_lesson_summaries
    # on User, which filters by user_id alone.
    add_index :ai_lesson_summaries, [:user_id, :lesson_id]

    # Helper queries lesson_id without a user filter when reusing existing scripts.
    add_index :ai_lesson_summaries, :lesson_id
  end
end
