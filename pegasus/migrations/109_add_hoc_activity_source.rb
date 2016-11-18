Sequel.migration do
  up do
    add_column :hoc_activity, :source, String, size: 50
    add_index :hoc_activity, :source
  end

  down do
    drop_index :hoc_activity, :source
    drop_column :hoc_activity, :source
  end
end
