Sequel.migration do
  up do
    # The tutorials table has been replaced by cdo_tutorials.
    drop_table?(:tutorials)
  end
end
