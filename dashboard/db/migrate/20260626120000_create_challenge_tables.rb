class CreateChallengeTables < ActiveRecord::Migration[7.0]
  def change
    create_table :challenges do |t|
      # Lesson maps to the legacy `stages` table, whose id is :integer, so the
      # FK column must match that type.
      t.references :lesson,
        null: false,
        type: :integer,
        foreign_key: {to_table: :stages}
      t.text :question, null: false
      # enum string: whiteboard / video. Null = no default.
      t.string :default_modality
      # Presence of alt text signals a starter image exists, letting callers skip
      # blind S3 lookups and keeping the image i18n-honest (translatable text).
      t.text :whiteboard_starter_image_alt_text

      t.timestamps
    end

    create_table :challenge_responses do |t|
      # challenges is a new bigint-id table, so the default bigint FK matches.
      # The composite index below covers challenge_id, so skip the per-column one.
      t.references :challenge, null: false, foreign_key: true, index: false
      # users.id is :integer, so the FK column must match that type.
      t.references :user, null: false, type: :integer, foreign_key: true
      # enum string: whiteboard / video / both (what the student actually used).
      t.string :modality
      t.text :student_text
      t.text :transcript
      t.text :student_feedback
      t.json :evaluation_result
      t.boolean :is_final, null: false, default: false
      t.datetime :evaluated_at

      t.timestamps
    end

    # Makes "fetch latest attempt for this student on this challenge" cheap.
    add_index :challenge_responses,
      [:challenge_id, :user_id, :created_at],
      name: 'index_challenge_responses_on_challenge_user_created'

    create_table :challenge_response_assets do |t|
      t.references :challenge_response, null: false, foreign_key: true
      # enum string: whiteboard_image / video / audio.
      t.string :asset_type, null: false

      t.timestamps
    end
  end
end
