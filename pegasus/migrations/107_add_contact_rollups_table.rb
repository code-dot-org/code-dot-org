Sequel.migration do
  change do
    create_table(:contact_rollups, charset: 'utf8') do
      primary_key :id, unsigned: true, null: false
      String :email, null: false
      Boolean :opted_out
      Int :dashboard_user_id
      Int :pardot_id
      DateTime :pardot_sync_at
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
      # comma-separated list of role names
      String :roles
      # comma-separated list of courses facilitated
      String :courses_facilitated, size: 1024
      # comma-separated list of courses enrolled in
      String :professional_learning_enrolled, size: 1024
      # comma-separated list of courses attended
      String :professional_learning_attended, size: 1024
      # comma-separated list of years this contact was HOC organizer
      String :hoc_organizer_years
      # comma-separated list of grades taught
      String :grades_taught
      # comma-separated list of ages taught
      String :ages_taught
      index [:email], unique: true
      index [:dashboard_user_id]
      index [:pardot_sync_at]
    end
  end
end
