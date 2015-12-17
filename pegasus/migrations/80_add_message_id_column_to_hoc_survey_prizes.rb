Sequel.migration do
  up do
    alter_table(:hoc_survey_prizes) do
      drop_index :claimant

      # can't be null for unique constraint to work. Use '' for unclaimed and legacy-claimed prizes
      add_column :purpose, String, size: 255, null: false, default: ''
      add_index [:claimant, :purpose], unique: true
    end
  end

  down do
    alter_table(:hoc_survey_prizes) do
      drop_column :purpose
      drop_index [:claimant, :purpose]
      add_index :claimant, unique: true
    end
  end
end
