class CreateQuizTables < ActiveRecord::Migration[7.0]
  def change
    create_table :quiz_questions do |t|
      t.string :type, null: false
      t.string :key, limit: 36, null: false
      t.references :parent, foreign_key: {to_table: :quiz_questions}
      t.string :name, null: false
      t.json :content, null: false
      t.text :explanation

      t.timestamps
    end
    add_index :quiz_questions, :key
    add_index :quiz_questions, :name, type: :fulltext

    create_table :quiz_question_standards do |t|
      t.references :quiz_question, null: false, foreign_key: true
      t.references :standard, null: false, type: :integer, foreign_key: true

      t.timestamps
    end
    add_index :quiz_question_standards, [:quiz_question_id, :standard_id],
      unique: true,
      name: 'index_quiz_question_standards_on_quiz_question_and_standard'

    create_table :quiz_question_placements do |t|
      t.references :level, null: false, type: :integer, foreign_key: true
      t.references :quiz_question, null: false, foreign_key: true
      t.integer :page, null: false, default: 1
      t.integer :position, null: false

      t.timestamps
    end
    add_index :quiz_question_placements, [:level_id, :quiz_question_id],
      unique: true,
      name: 'index_quiz_question_placements_on_level_and_question'

    create_table :quiz_attempts do |t|
      t.references :user, null: false, type: :integer, foreign_key: true
      t.references :level, null: false, type: :integer, foreign_key: true
      # Unit's table is still named "scripts" (legacy) - references :unit
      # would otherwise infer :units, which doesn't exist.
      t.references :unit, null: false, type: :integer, foreign_key: {to_table: :scripts}
      t.integer :attempt_number, null: false
      t.datetime :started_at, null: false
      t.datetime :submitted_at
      t.integer :score
      t.integer :max_score

      t.timestamps
    end
    add_index :quiz_attempts, [:user_id, :level_id, :unit_id, :attempt_number],
      unique: true,
      name: 'index_quiz_attempts_on_user_level_unit_attempt'

    create_table :quiz_question_responses do |t|
      t.references :quiz_attempt, null: false, foreign_key: true
      t.references :quiz_question, null: false, foreign_key: true
      t.json :response_data, null: false
      t.integer :max_score
      t.integer :score
      t.string :grading_status, null: false
      t.integer :time_spent_seconds

      t.timestamps
    end
    add_index :quiz_question_responses, [:quiz_attempt_id, :quiz_question_id],
      unique: true,
      name: 'index_quiz_question_responses_on_attempt_and_question'
  end
end
