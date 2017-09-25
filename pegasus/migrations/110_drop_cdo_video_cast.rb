Sequel.migration do
  up do
    drop_table? :cdo_video_cast
    self[:seed_info].where(table: 'cdo_video_cast').delete
  end
end
