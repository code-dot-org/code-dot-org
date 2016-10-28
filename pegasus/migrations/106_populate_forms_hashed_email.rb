require 'digest/md5'

# Based off of 097_populate_contacts_hashed_email.rb
Sequel.migration do
  up do
    from(:forms).where(hashed_email: nil).each do |form|
      hashed_email = Digest::MD5.hexdigest(form[:email])
      from(:forms).
          where(id: form[:id]).
          update(hashed_email: hashed_email)
    end

    alter_table(:forms) do
      set_column_not_null :hashed_email
    end
  end

  down do
    alter_table(:forms) do
      set_column_allow_null :hashed_email
    end
  end
end
