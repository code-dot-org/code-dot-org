class CreateAnonymousLevelClients < ActiveRecord::Migration[7.1]
  def change
    create_table :anonymous_level_clients do |t|
      t.string :anon_user_id, limit: 36, null: false, index: {unique: true}

      t.string :app_name
      t.string :install_source

      t.timestamps
    end
  end
end
