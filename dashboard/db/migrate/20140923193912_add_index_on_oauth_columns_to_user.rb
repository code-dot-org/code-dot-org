class AddIndexOnOauthColumnsToUser < ActiveRecord::Migration
  def change
    add_index 'users', ['provider', 'uid'], unique: true
  end
end
