Sequel.migration do
  up do
    create_table(:seed_info, charset:'utf8') do
      primary_key :id
      String :table, unique_index:true, required:true
      DateTime :mtime, required:true
    end
  end

  down do
    drop_table(:seed_info)
  end
end
