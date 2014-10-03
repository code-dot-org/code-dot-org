Sequel.migration do
  up do
    add_column :poste_clicks, :contact_id, Integer, null:false
    add_index :poste_clicks, :contact_id
    add_column :poste_clicks, :message_id, Integer, null:false
    add_index :poste_clicks, :message_id
  end

  down do
    drop_column :poste_clicks, :contact_id
    drop_column :poste_clicks, :message_id
  end
end
