Sequel.migration do
  up do
    add_column :hoc_activity, :name, String, size: 255
    add_column :hoc_activity, :country, String, size: 50
    add_column :hoc_activity, :state, String, size: 50

    add_index  :hoc_activity, :country
    add_index  :hoc_activity, :state
  end

  down do
    drop_index  :hoc_activity, :country
    drop_index  :hoc_activity, :state

    drop_column :hoc_activity, :name
    drop_column :hoc_activity, :country
    drop_column :hoc_activity, :state
  end
end
