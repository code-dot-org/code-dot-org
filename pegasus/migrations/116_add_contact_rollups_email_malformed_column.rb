Sequel.migration do
  change do
    alter_table(:contact_rollups) do
      add_column :email_malformed, TrueClass
    end
  end
end
