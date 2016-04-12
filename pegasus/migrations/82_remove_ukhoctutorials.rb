Sequel.migration do
  up do
    drop_table? :uk_tutorials
  end

  down do
  end
end
