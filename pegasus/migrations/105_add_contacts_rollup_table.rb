Sequel.migration do
  change do
    create_table(:contacts_rollup, charset: 'utf8') do
      primary_key :id, unsigned: true, null: false
      String :email
      Int :dashboard_user_id
      String :name
      String :street_address, size: 1024
      String :city
      String :state
      String :country
      String :postal_code
      String :district_name
      String :district_city
      String :district_state
      String :district_zip
      String :school_name
      String :roles
      String :facilitator_type, size: 1024
      String :professional_learning_enrolled, size: 1024
      String :professional_learning_attended, size: 1024
      String :hoc_organizer
      String :grades_taught
      String :ages_taught
      index [:email], unique: true
      index [:dashboard_user_id]
    end
  end
end
