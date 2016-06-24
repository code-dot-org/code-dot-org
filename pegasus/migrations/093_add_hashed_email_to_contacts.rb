Sequel.migration do
  change do
    add_column :contacts, :hashed_email, String
  end
end
