Sequel.migration do
  change do
    alter_table(:storage_apps) do
      # The id of the row in this table that this row was remixed from, if any.
      add_column :remix_parent_id, Integer
    end
  end
end
