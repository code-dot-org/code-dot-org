Sequel.migration do
  up do
    alter_table(:hoc_activity) do
      set_column_allow_null :tutorial
    end
  end

  down do
    alter_table(:hoc_activity) do
      set_column_not_null :tutorial
    end
  end
end
