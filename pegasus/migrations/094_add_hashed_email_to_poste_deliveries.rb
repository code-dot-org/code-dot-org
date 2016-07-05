Sequel.migration do
  change do
    add_column :poste_deliveries, :hashed_email, String
  end
end
