class AddUniqueIndexAndIndicesToAiStudentPodcasts < ActiveRecord::Migration[7.0]
  def change
    # Enforces "one podcast per (user, lesson)" and serves the (user_id, lesson_id)
    # lookups in AiStudentPodcastsController. Leftmost prefix also covers any
    # user_id-only query that might land later.
    add_index :ai_student_podcasts, [:user_id, :lesson_id], unique: true

    # AiStudentPodcastsHelper#generate_podcast_script queries by lesson_id alone
    # when looking for an existing script to reuse across users.
    add_index :ai_student_podcasts, :lesson_id
  end
end
