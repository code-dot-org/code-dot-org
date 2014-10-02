Sequel.migration do
  up do
    create_table(:poste_urls, charset:'utf8') do
      primary_key :id
      String :hash, size:64, index:true, null:false
      Text :url, null:false
    end
  end

  down do
    drop_table(:poste_urls)
  end
end
