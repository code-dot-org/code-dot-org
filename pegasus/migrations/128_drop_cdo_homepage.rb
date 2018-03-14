Sequel.migration do
  up do
    drop_table? :cdo_homepage
    self[:seed_info].where(table: 'cdo_homepage').delete
  end
end
