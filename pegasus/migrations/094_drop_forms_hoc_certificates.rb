Sequel.migration do
  up do
    drop_table :forms_hoc_certificates
  end

  down do
    create_table :forms_hoc_certificates do
      String name, size: 50
      String session, size: 50, null: false
      DateTime created_at
      String created_ip, size: 39
      Integer contact_id, unsigned: true, null: false
      String contact_email, size: 254, null: false

      index [:session], unique: true
      index [:contact_id, :contact_email]
    end
  end
end
