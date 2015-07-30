Sequel.migration do
  up do
    create_table?(:hoc_survey_prizes, charset: 'utf8') do
      primary_key :id
      String :type, null: false, index: true
      String :value, null: false

      foreign_key :claimant, unique: true, index: true
      DateTime :claimed_at
      String :claimed_ip, size: 39
    end
  end

  down do
    drop_table? :hoc_survey_prizes
  end
end
