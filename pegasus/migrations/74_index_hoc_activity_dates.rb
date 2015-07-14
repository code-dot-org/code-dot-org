Sequel.migration do
  up do
    add_index :hoc_activity, :started_at
    add_index :hoc_activity, :finished_at
    add_index :hoc_activity, :pixel_started_at
    add_index :hoc_activity, :pixel_finished_at
  end

  down do
    drop_index  :hoc_activity, :started_at
    drop_index  :hoc_activity, :finished_at
    drop_index  :hoc_activity, :pixel_started_at
    drop_index  :hoc_activity, :pixel_finished_at
  end
end
