Sequel.migration do
  change do
    alter_table(:contact_rollups) do
      add_index :pardot_id
    end
  end
end
