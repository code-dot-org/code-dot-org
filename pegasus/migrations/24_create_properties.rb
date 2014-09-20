Sequel.migration do
  up do
    drop_table?(:daemon_data_items) # Drop DataMapper version of the table if still around.

    create_table(:properties, charset:'utf8') do
      String :key, primary_key:true
      Text :value, size:1024*1024
    end
  end

  down do
    drop_table(:properties)
  end
end
