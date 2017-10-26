Sequel.migration do
  change do
    alter_table(:tutorials) do
      add_column :displayweight_k5, String
      add_column :displayweight_middle, String
      add_column :displayweight_high, String
    end
  end
end
