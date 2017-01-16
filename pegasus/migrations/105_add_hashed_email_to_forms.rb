Sequel.migration do
  change do
    add_column :forms, :hashed_email, String
    add_index :forms, :hashed_email
  end
end
