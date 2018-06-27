# Virtual generated columns mapping :JSON columns to :Text,
# because Database Migration Service doesn't support JSON-column data type.
Sequel.migration do
  change do
    alter_table(:forms) do
      add_column :data_text, :Text, generated_always_as: :data
      add_column :processed_data_text, :Text, generated_always_as: :processed_data
    end
  end
end
