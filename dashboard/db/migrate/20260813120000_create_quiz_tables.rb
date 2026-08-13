class CreateQuizTables < ActiveRecord::Migration[7.0]
  def change
    create_table :quiz_questions do |t|
      # STI discriminator: FreeResponseQuestion, MultipleChoiceQuestion,
      # MultipleSelectQuestion, MatchQuestion (see app/models/quiz_question.rb).
      # Add new question types as new subclasses, not new columns.
      t.string :type, null: false
      # Stable across every revision of a question. Not unique - every
      # revision of a question shares the same key; parent_id below chains
      # the revisions themselves.
      t.string :question_key, limit: 36, null: false
      t.references :parent, foreign_key: {to_table: :quiz_questions}
      t.string :question_name, null: false
      # Stem, answer choices, and correct answer(s). Shape depends on
      # `type`; the frontend owns that contract.
      t.json :question, null: false
      t.text :explanation

      t.timestamps
    end
    add_index :quiz_questions, :question_key

    create_table :quiz_question_standards do |t|
      # Composite unique index below covers quiz_question_id lookups, so
      # skip the redundant single-column index.
      t.references :quiz_question, null: false, foreign_key: true, index: false
      # standards.id is :integer (legacy table), so the FK column must match.
      t.references :standard, null: false, type: :integer, foreign_key: true

      t.timestamps
    end
    add_index :quiz_question_standards, [:quiz_question_id, :standard_id],
      unique: true,
      name: 'index_quiz_question_standards_on_quiz_question_and_standard'

    create_table :quiz_level_questions do |t|
      # levels.id is :integer (legacy table), so the FK column must match.
      # Composite unique index below covers level_id lookups, so skip the
      # redundant single-column index.
      t.references :level, null: false, type: :integer, foreign_key: true, index: false
      t.references :quiz_question, null: false, foreign_key: true
      t.integer :page, null: false, default: 1
      t.integer :position, null: false

      t.timestamps
    end
    add_index :quiz_level_questions, [:level_id, :quiz_question_id],
      unique: true,
      name: 'index_quiz_level_questions_on_level_and_question'

    create_table :quiz_attempts do |t|
      # users.id, levels.id, and scripts.id are all :integer (legacy tables).
      # Composite unique index below covers user_id lookups, so skip the
      # redundant single-column index.
      t.references :user, null: false, type: :integer, foreign_key: true, index: false
      t.references :level, null: false, type: :integer, foreign_key: true
      t.references :script, null: false, type: :integer, foreign_key: true
      t.integer :attempt_number, null: false
      t.datetime :started_at, null: false
      t.datetime :submitted_at
      # score/max_score only sum auto-graded question responses; see
      # QuizQuestionResponse#grading_status.
      t.integer :score
      t.integer :max_score

      t.timestamps
    end
    add_index :quiz_attempts, [:user_id, :level_id, :script_id, :attempt_number],
      unique: true,
      name: 'index_quiz_attempts_on_user_level_script_attempt'

    create_table :quiz_question_responses do |t|
      # Composite unique index below covers quiz_attempt_id lookups, so skip
      # the redundant single-column index.
      t.references :quiz_attempt, null: false, foreign_key: true, index: false
      t.references :quiz_question, null: false, foreign_key: true
      t.json :response_data, null: false
      t.integer :max_score
      t.integer :score
      # enum string: auto_graded / pending_ai / pending_manual / ai_graded /
      # teacher_graded / ungraded. See QuizQuestionResponse::GRADING_STATUSES.
      t.string :grading_status, null: false
      t.boolean :rubric_score
      t.integer :time_spent_seconds

      t.timestamps
    end
    add_index :quiz_question_responses, [:quiz_attempt_id, :quiz_question_id],
      unique: true,
      name: 'index_quiz_question_responses_on_attempt_and_question'
  end
end
