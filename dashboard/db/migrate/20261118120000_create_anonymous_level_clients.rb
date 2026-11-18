class CreateAnonymousLevelClients < ActiveRecord::Migration[7.1]
  def change
    create_table :anonymous_level_clients do |t|
      t.string :anon_user_id, limit: 36, null: false, index: {unique: true}

      t.string :os_name
      t.string :os_version

      t.string :browser_name
      t.string :browser_version

      t.string :app_name
      t.string :app_version
      t.string :install_source

      t.timestamps
    end
  end
end
