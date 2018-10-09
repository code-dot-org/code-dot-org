Sequel.migration do
  up do
    drop_table?(:uk_quotes)
  end

  down do
  end
end
