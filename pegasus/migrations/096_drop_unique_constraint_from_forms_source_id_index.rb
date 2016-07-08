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

  down do
    alter_table(:forms) do
      drop_index [:source_id, :kind]
    end
  end
end
