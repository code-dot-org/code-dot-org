# Quiz (a Level) destroy should leave student attempts intact but disconnected,
# not restrict or cascade. level_id is nullable so a deleted quiz can SET NULL.
class NullifyQuizAttemptsLevelIdOnLevelDelete < ActiveRecord::Migration[7.0]
  def up
    change_column_null :quiz_attempts, :level_id, true
    remove_foreign_key :quiz_attempts, :levels
    add_foreign_key :quiz_attempts, :levels, on_delete: :nullify
  end

  def down
    # A quiz deleted since this migration ran leaves rows with a null
    # level_id - rolling back would fail partway through the DDL below
    # (change_column_null last, after the FK's already back), leaving the
    # schema stuck in between. Check first instead.
    if QuizAttempt.exists?(level_id: nil)
      raise ActiveRecord::IrreversibleMigration, 'quiz_attempts has rows with a null level_id'
    end

    remove_foreign_key :quiz_attempts, :levels
    add_foreign_key :quiz_attempts, :levels
    change_column_null :quiz_attempts, :level_id, false
  end
end
