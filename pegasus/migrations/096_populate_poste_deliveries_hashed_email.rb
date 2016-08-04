require 'digest/md5'

Sequel.migration do
  up do
    from(:poste_deliveries).where(hashed_email: nil).each do |delivery|
      hashed_email = Digest::MD5.hexdigest(delivery[:contact_email])
      from(:poste_deliveries).
        where(id: delivery[:id]).
        update(hashed_email: hashed_email)
    end

    alter_table(:poste_deliveries) do
      set_column_not_null :hashed_email
    end
  end

  down do
    alter_table(:poste_deliveries) do
      set_column_allow_null :hashed_email
    end
  end
end
