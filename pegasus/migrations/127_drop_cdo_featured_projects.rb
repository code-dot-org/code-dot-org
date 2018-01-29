Sequel.migration do
  up do
    drop_table? :cdo_featured_projects
    self[:seed_info].where(table: 'cdo_featured_projects').delete
  end
end
