Sequel.migration do
  up do
    drop_table?(:cdo_events_whitelist)
    self[:seed_info].where(table: 'cdo_events_whitelist').delete
  end
end
