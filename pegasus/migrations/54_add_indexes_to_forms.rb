Sequel.migration do
  up do
    add_index :forms, :created_at
    add_index :forms, :updated_at
    add_index :forms, :processed_at
    add_index :forms, :notified_at
    add_index :forms, :indexed_at
    add_index :forms, :reviewed_at
  end

  down do
  end
end
