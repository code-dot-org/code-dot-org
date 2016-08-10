class DropUserTrophiesAndTrophies < ActiveRecord::Migration
  def up
    drop_table :user_trophies if ActiveRecord::Base.connection.table_exists? :user_trophies
    drop_table :trophies if ActiveRecord::Base.connection.table_exists? :trophies
  end
end
