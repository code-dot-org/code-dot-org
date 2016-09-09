Sequel.migration do
  change do
    alter_table :form_geos do
      add_column :indexed_at, DateTime
      add_index :indexed_at
    end
  end
end
