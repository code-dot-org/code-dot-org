Sequel.migration do
  change do
    add_column :hoc_activity, :source, String, size: 50
    add_index :hoc_activity, :source
  end
end
