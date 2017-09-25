Sequel.migration do
  change do
    alter_table(:storage_apps) do
      # Indicates whether the row represents a standalone project or a channel-backed level.
      # TODO(asher): After this column is back-populated with data, this column should be set to
      # null: false and default: true.
      # TODO(asher): This column is redundant with the `hidden` key in the `values` JSON blob. After
      # this column is fully populated, the JSON key could be eliminated.
      add_column :standalone, TrueClass, default: true
      add_index :standalone
    end
  end
end
