Sequel.migration do
  up do
    drop_table? :app_properties
  end
end
