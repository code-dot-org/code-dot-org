Sequel.migration do
  up do
    alter_table(:contacts) do
      add_index :unsubscribed_at
      drop_index :unsubscribed_on
    end
  end

  down do
    alter_table(:contacts) do
      add_index :unsubscribed_on
      drop_index :unsubscribed_at
    end
  end
end
