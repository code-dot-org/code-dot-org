Sequel.migration do
  change do
    alter_table(:contacts) do
      add_index :hashed_email
    end
  end
end
