Sequel.migration do
  up do
    add_column :hoc_activity, :name, String, size:255
  end

  down do
    drop_column :hoc_activity, :name
  end
end
