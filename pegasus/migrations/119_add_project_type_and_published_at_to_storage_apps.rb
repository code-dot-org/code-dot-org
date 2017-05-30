Sequel.migration do
  change do
    alter_table(:storage_apps) do
      add_column :project_type, String
      add_index :project_type

      add_column :published_at, DateTime
      add_index :published_at
    end
  end
end
