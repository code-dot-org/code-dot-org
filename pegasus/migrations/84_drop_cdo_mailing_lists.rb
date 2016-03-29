Sequel.migration do
  up do
    drop_table?(:cdo_mailing_lists)
    self[:seed_info].where(table: 'cdo_mailing_lists').delete
  end
end
