Sequel.migration do
  up do
    create_table?(:tables, charset:'utf8') do
      primary_key :id, unsigned:true, null:false
      foreign_key :app_id, index:true, null:false
      foreign_key :storage_id, index:true
      String :table_name, size:50, index:true, null:false
      Integer :row_id, unsigned:true, index:true, null:false
      Text :value
      
      DateTime :updated_at, null:false
      String :updated_ip, size:39, null:false
      
      index [:app_id,:storage_id,:table_name,:row_id], unique:true
    end
  end

  down do
    #drop_table? :property_bags
  end
end
