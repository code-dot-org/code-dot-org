Sequel.migration do
  up do
    drop_table? :cdo_educate
    self[:seed_info].where(table: 'cdo_educate').delete
  end
end
