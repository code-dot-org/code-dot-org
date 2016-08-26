Sequel.migration do
  up do
    drop_column :hoc_survey_prizes, :claimant

    add_column :hoc_survey_prizes, :claimant, String, size: 255
    add_index :hoc_survey_prizes, :claimant, unique: true
  end

  down do
    drop_column :hoc_survey_prizes, :claimant

    add_column :hoc_survey_prizes, :claimant, Integer
    add_index :hoc_survey_prizes, :claimant, unique: true
  end
end
