Sequel.migration do
  change do
    alter_table(:cdo_languages) do
      add_index :supported_codeorg_b
    end
  end
end
