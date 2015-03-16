Sequel.migration do
  up do
    add_column :storage_apps, :state, String, size: 50
  end

  down do
    drop_column :storage_apps, :state
  end
end
