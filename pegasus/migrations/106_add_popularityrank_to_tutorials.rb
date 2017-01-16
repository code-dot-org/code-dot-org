Sequel.migration do
  change do
    alter_table(:tutorials) do
      add_column :popularityrank, Integer, null: false
    end
  end
end
