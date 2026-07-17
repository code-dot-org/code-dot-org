class CreateQuizTables < ActiveRecord::Migration[7.0]
  def change
    create_table :quiz_questions do |t|
      # Real column, not buried in the jsonb blob, so type is queryable/dispatchable
      # without parsing JSON — matters once more than one type exists.
      t.string :question_type, null: false
      # The rest of the SurveyJS element: name/title/choices/correctAnswer.
      t.json :survey_element, null: false

      t.timestamps
    end

    create_table :quiz_level_questions do |t|
      # levels.id is a legacy :integer PK, so the FK column must match.
      t.references :level, null: false, type: :integer, foreign_key: true
      t.references :quiz_question, null: false, foreign_key: true
      t.integer :page_number, null: false, default: 0
      t.integer :position, null: false

      t.timestamps
    end
    add_index :quiz_level_questions, [:level_id, :page_number, :position],
      name: 'index_quiz_level_questions_on_level_page_position'

    create_table :quiz_responses do |t|
      # levels.id and users.id are legacy :integer PKs, so the FK columns must match.
      t.references :level, null: false, type: :integer, foreign_key: true
      t.references :user, null: false, type: :integer, foreign_key: true
      # Bare column, no FK constraint — matches UserLevel's script_id.
      t.integer :script_id
      # Whole-survey {name: value} blob, per question, straight from SurveyJS's
      # onComplete. Not split into per-question rows yet — deferred until we
      # need per-item scoring/analysis.
      t.json :response_data, null: false
      t.datetime :submitted_at

      t.timestamps
    end
    add_index :quiz_responses, [:level_id, :user_id, :created_at],
      name: 'index_quiz_responses_on_level_user_created'
  end
end
