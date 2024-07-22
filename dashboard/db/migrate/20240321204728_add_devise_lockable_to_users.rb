# frozen_string_literal: true

# Adds all fields required for enabling Devise's Lockable functionality to the
# User model, in preparation for enabling the feature.
#
# See https://github.com/heartcombo/devise/wiki/How-To:-Add-:lockable-to-Users
class AddDeviseLockableToUsers < ActiveRecord::Migration[6.1]
  def self.up
    # Note that we do not add `failed_attempts` or `locked_at` here.
    # Because neither field is used for querying, neither needs to be an actual
    # column; we therefore implement both in the properties blob.
    add_column :users, :unlock_token, :string

    # Attempting to create this index via a migration will fail on a table as
    # large as the one we have in production. To avoid that, we plan to execute
    # the index creation query manually after the rest of this migration has
    # completed.
    #
    # Specifically: on MySQL 8.0, adding an index does not lock the table but
    # it does still take quite a while to apply successfully (see
    # https://dev.mysql.com/doc/refman/8.0/en/innodb-online-ddl-operations.html#online-ddl-column-syntax-notes).
    # When tested against a clone of our production database, this operation
    # took approximately 35 minutes, much longer than the 30 seconds migrations
    # will wait before erroring out. To create the index without the time limit
    # enforced by migrations, we should run this command from a bash shell on
    # production-console:
    #
    #     nohup mysql-client-dashboard-writer "CREATE UNIQUE INDEX index_users_on_unlock_token ON users (unlock_token)" &
    unless Rails.env.production?
      add_index :users, :unlock_token, unique: true
    end
  end

  def self.down
    remove_index :users, :unlock_token
    remove_column :users, :unlock_token
  end
end
