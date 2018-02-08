Sequel.migration do
  change do
    alter_table(:tutorials) do
      add_column :popularityrank_pre, Integer, null: false
      add_column :popularityrank_25, Integer, null: false
      add_column :popularityrank_middle, Integer, null: false
      add_column :popularityrank_high, Integer, null: false
    end
  end
end
