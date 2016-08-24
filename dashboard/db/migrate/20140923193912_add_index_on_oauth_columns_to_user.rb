class AddIndexOnOauthColumnsToUser < ActiveRecord::Migration[4.2]
  def change
    add_index 'users', ['provider', 'uid'], unique: true
  end
end
