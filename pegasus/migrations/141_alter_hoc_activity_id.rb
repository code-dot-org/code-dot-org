Sequel.migration do
  up do
    # This change will be implemented on production using the MySQL gh-ost tool.
    unless rack_env?(:production)
      alter_table(:hoc_activity) do
        set_column_type :id, :Bignum
      end
    end
  end

  down do
    # This change will be implemented on production using the MySQL gh-ost tool.
    unless rack_env?(:production)
      alter_table(:hoc_activity) do
        set_column_type :id, integer
      end
    end
  end
end
