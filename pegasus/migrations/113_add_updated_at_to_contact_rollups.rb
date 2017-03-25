Sequel.migration do
  change do
    alter_table(:contact_rollups) do
      add_column :updated_at, DateTime
      add_index :updated_at
    end
  end
end
