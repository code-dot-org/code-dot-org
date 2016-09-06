Sequel.migration do
  change do
    alter_table(:tutorials) do
      add_column :tags_grade, String
      add_column :tags_teacher_experience, String
      add_column :tags_student_experience, String
      add_column :tags_activity_type, String
      add_column :tags_subject, String
      add_column :tags_platform, String
      add_column :tags_length, String
      add_column :tags_programming_language, String
    end
  end
end
