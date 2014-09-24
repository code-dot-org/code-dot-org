Sequel.migration do
  up do
    drop_table?(:hoc_activity)

    create_table(:hoc_activity, charset:'utf8') do
      primary_key :id
      String :session, unique:true, null:false, index:true, size:50
      String :referer, size:50
      String :company, index:true, size:50
      String :tutorial, index:true, null:false, size:50

      DateTime :started_at
      String :started_ip, size:50
      DateTime :pixel_started_at
      String :pixel_started_ip, size:50
      DateTime :pixel_finished_at
      String :pixel_finished_ip, size:50
      DateTime :finished_at
      String :finished_ip, size:50

      String :country_code, index:true, size:2
      String :state_code, index:true, size:2 # e.g.
      String :city, index:true, size:50
      String :location, size:50 # "lat,long"
    end
  end

  down do
    drop_table(:hoc_activity)
  end
end
