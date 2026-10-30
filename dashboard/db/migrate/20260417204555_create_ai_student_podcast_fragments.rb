class CreateAiStudentPodcastFragments < ActiveRecord::Migration[7.0]
  def change
    create_table :ai_student_podcast_fragments do |t|
      t.bigint :user_id
      t.integer :lesson_id
      t.string :fragment_type
      t.integer :objective_id
      t.text :podcast_script

      t.timestamps
    end
  end
end
