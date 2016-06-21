Sequel.migration do
  up do
    drop_table?(:i18n_strings)
  end
end
