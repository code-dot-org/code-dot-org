Sequel.migration do
  up do
    alter_table(:tutorials) do
      set_column_type :string_standards, :Text
    end
  end

  down do
    alter_table(:tutorials) do
      set_column_type :string_standards, String
    end
  end
end
