Sequel.migration do
  up do
    drop_table?(:state_promote)
    self[:seed_info].where(table: 'state_promote').delete
  end
end
