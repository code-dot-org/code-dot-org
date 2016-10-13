Sequel.migration do
  change do
    alter_table(:tutorials) do
      add_column :string_detail_grades, String
      add_column :string_platforms, String
      add_column :string_detail_platforms, String
      add_column :string_detail_programming_languages, String
      add_column :string_standards, String
    end
  end
end
