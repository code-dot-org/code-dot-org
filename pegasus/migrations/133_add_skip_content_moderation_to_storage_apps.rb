Sequel.migration do
  change do
    alter_table(:storage_apps) do
      add_column :skip_content_moderation, TrueClass
    end
  end
end
