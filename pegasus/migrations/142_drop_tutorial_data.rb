Sequel.migration do
  up do
    %i[cdo_tutorials cdo_tutorials_more cdo_tutorials_preview].each do |table|
      drop_table?(table)
    end
  end
end
