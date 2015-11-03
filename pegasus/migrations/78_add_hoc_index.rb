Sequel.migration do
  up do
    add_index :forms, [:email, :name]
  end

  down do
  end
end
