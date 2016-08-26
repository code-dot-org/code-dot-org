Sequel.migration do
  up do
    drop_table?(:forms_schools)
  end
end
