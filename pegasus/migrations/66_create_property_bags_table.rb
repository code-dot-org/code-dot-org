Sequel.migration do
  up do
    create_table?(:property_bags, charset:'utf8') do
      primary_key :id, unsigned:true, null:false
      foreign_key :app_id, index:true, null:false
      foreign_key :storage_id, index:true
      String :name, index:true, null:false
      Text :value
      
      DateTime :updated_at, null:false
      String :updated_ip, size:39, null:false
      
      index [:app_id,:storage_id,:name], unique:true
    end
  end

  down do
    #drop_table? :property_bags
  end
end
