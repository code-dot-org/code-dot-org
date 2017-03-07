Sequel.migration do
  change do
    alter_table(:contact_rollups) do
      add_column :forms_submitted, String
      add_column :form_roles, String
    end
  end
end
