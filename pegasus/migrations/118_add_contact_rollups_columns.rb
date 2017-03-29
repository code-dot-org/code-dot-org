Sequel.migration do
  change do
    alter_table(:contact_rollups) do
      add_column :forms_submitted, String, size: 4096
      add_column :form_roles, String, size: 4096
    end
  end
end
