Sequel.migration do
  change do
    alter_table(:tutorials) do
      add_column :displayweight_k5, Integer, null: false
      add_column :displayweight_middle, Integer, null: false
      add_column :displayweight_high, Integer, null: false
    end
  end
end
