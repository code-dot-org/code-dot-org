class RenameAndRefactorAiStudentPodcastFragments < ActiveRecord::Migration[7.0]
  def change
    rename_table :ai_student_podcast_fragments, :ai_student_podcasts

    remove_column :ai_student_podcasts, :fragment_type, :string
    remove_column :ai_student_podcasts, :objective_id, :integer

    create_table :ai_student_podcast_objectives do |t|
      t.bigint :ai_student_podcast_id, null: false
      t.integer :objective_id, null: false
    end

    add_index :ai_student_podcast_objectives, :ai_student_podcast_id
    add_index :ai_student_podcast_objectives, :objective_id
    add_index :ai_student_podcast_objectives,
      [:ai_student_podcast_id, :objective_id],
      unique: true,
      name: 'index_ai_student_podcast_objectives_unique'
  end
end
