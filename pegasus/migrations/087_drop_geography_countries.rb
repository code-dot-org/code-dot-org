Sequel.migration do
  up do
    drop_table?(:geography_countries)
    self[:seed_info].where(table: 'geography_countries').delete
  end
end
