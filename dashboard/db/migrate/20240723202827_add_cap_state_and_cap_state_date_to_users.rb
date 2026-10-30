class AddCAPStateAndCAPStateDateToUsers < ActiveRecord::Migration[6.1]
  def up
    add_column :users, :cap_state, :string, limit: 1
    add_column :users, :cap_state_date, :datetime

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
    #     nohup mysql-client-dashboard-writer "CREATE INDEX index_users_on_cap_state_and_cap_state_date ON users (cap_state, cap_state_date)" &
    add_index :users, %i[cap_state cap_state_date] unless Rails.env.production?
  end

  def down
    remove_index :users, %i[cap_state cap_state_date], if_exists: true
    remove_column :users, :cap_state, :string
    remove_column :users, :cap_state_date, :datetime
  end
end
