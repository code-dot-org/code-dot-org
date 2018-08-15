Sequel.migration do
  change do
    alter_table(:contact_rollups) do
      add_column :opt_in, TrueClass
    end
  end
end
