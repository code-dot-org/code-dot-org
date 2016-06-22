require 'digest/md5'

Sequel.migration do
  change do
    add_column :contacts, :hashed_email, String
  end
end
