class AddUniqueIndexOnLessonIdToRubrics < ActiveRecord::Migration[7.0]
  # Enforces "one rubric per lesson" at the database level. The pre-existing
  # composite index on (lesson_id, level_id) only blocked a second rubric on
  # the *same* level, which let a lesson accumulate one rubric per level. This
  # index makes lesson_id itself unique.
  #
  # This migration is non-destructive and assumes duplicate rubrics have
  # already been removed by a separate, reviewed cleanup (keeping the oldest
  # rubric per lesson). It will fail to build if any lesson still owns more
  # than one rubric.
  def change
    add_index :rubrics, :lesson_id, unique: true
  end
end
