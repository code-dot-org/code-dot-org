require 'digest/md5'

Sequel.migration do
  up do
    alter_table :forms do
      add_column :hashed_email, String
      add_index :hashed_email
    end

    # Update the existing data for HOC 2016 signups only to keep the
    # count reasonable:
    # mysql> select count(1) from forms where kind='HocSignup2016';
    # +----------+
    # | count(1) |
    # +----------+
    # |    48786 |
    # +----------+
    # 1 row in set (0.07 sec)
    from(:forms).where(kind: 'HocSignup2016').each do |form|
      hashed_email = Digest::MD5.hexdigest(form[:email])
      from(:contacts).
        where(id: form[:id]).
        update(hashed_email: hashed_email)
    end
  end

  down do
    drop_column :forms, :hashed_email
  end
end
