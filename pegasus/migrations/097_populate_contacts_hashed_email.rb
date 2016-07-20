require 'digest/md5'

Sequel.migration do
  up do
    from(:contacts).where(hashed_email: nil).each do |contact|
      hashed_email = Digest::MD5.hexdigest(contact[:email])
      from(:contacts).
        where(id: contact[:id]).
        update(hashed_email: hashed_email)
    end

    alter_table(:contacts) do
      set_column_not_null :hashed_email
    end
  end

  down do
    alter_table(:contacts) do
      set_column_allow_null :hashed_email
    end
  end
end
