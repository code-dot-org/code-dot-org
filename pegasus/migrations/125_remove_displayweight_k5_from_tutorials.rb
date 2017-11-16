Sequel.migration do
  change do
    alter_table(:tutorials) do
      drop_column :displayweight_k5
    end
  end
end
