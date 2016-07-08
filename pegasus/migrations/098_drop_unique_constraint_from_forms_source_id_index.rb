Sequel.migration do
  up do
    # For some reason this unique index only exists on production, but not staging or test.
    # Conditionally drop it if it exists.
    if self.indexes(:forms)[:unique_forms_source_id]
      alter_table(:forms) do
        drop_index :source_id, name: :unique_forms_source_id
      end
    end

    # Replace with a unique index on source_id and kind (rather than just source_id).
    alter_table(:forms) do
      add_index [:source_id, :kind], unique: true
    end
  end

  # Note in production (or any other place where the original index existed)
  # this will not recreate it and will not leave the DB in its original state.
  # It will however still be able to migrate up and down.
  down do
    alter_table(:forms) do
      drop_index [:source_id, :kind]
    end
  end
end
