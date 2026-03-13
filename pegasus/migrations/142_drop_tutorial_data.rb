Sequel.migration do
  up do
    %i[cdo_tutorials cdo_tutorials_more cdo_tutorials_preview].each do |table|
      drop_table?(table)

      CDO.cache.delete("Tutorials/#{table}/column_aliases")
      CDO.cache.delete("Tutorials/#{table}/contents")
      CDO.cache.delete("CdoTutorials/#{table}/ids_by_code")
      CDO.cache.delete("Tutorials/#{table}/ids_by_short_code")
    end
  end
end
