Sequel.migration do
  change do
    alter_table(:tutorials) do
      add_column :displayweight_pre, Integer, null: false
      add_column :displayweight_25, Integer, null: false
    end
  end
end
