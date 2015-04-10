Sequel.migration do
  up do
    add_column :storage_apps, :state, String, size: 50, default: 'active', null: false
  end

  down do
    drop_column :storage_apps, :state
  end
end
