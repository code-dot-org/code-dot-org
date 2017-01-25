Sequel.migration do
  up do
    drop_table? :cdo_cspunit3_videos
    self[:seed_info].where(table: 'cdo_cspunit3_videos').delete
  end
end
