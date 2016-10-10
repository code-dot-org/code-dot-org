Sequel.migration do
  change do
    create_table(:forms_geos, charset: 'utf8') do
      primary_key :id, unsigned: true, null: false
      foreign_key :forms_id, null: false, index: true
      DateTime :created_at, null: false
      DateTime :updated_at, null: false
      String :ip_address, size: 39
      String :city
      String :state
      String :country
      String :postal_code
      Decimal :latitude, size: [8, 6]
      Decimal :longitude, size: [9, 6]
    end
  end
end
