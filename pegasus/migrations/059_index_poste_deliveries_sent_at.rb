Sequel.migration do
  up do
    add_index :poste_deliveries, :sent_at
  end

  down do
  end
end
