Sequel.migration do
  up do
    drop_table?(:geography_us_states)
    self[:seed_info].where(table: 'geography_us_states').delete
  end
end
