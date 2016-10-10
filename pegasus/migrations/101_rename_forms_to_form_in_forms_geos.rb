Sequel.migration do
  change do
    rename_table :forms_geos, :form_geos
    rename_column :form_geos, :forms_id, :form_id
  end
end
