Sequel.migration do
  up do
    add_index :forms, [:kind, :email, :name]
  end

  down do
    drop_index :forms, [:kind, :email, :name]
  end
end
