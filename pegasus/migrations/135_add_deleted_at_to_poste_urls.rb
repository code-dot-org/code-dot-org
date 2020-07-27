Sequel.migration do
  change do
    alter_table(:poste_urls) do
      add_column :deleted_at, DateTime
    end
  end
end
